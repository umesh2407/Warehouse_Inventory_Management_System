/**
 * Migration: backfill soft-delete fields on users
 *
 * Sets isDeleted: false and deletedAt: null on any user document
 * that does not already have isDeleted defined.
 * Also syncs the users email unique index to a partial index
 * (unique only when isDeleted is false).
 *
 * Run: npm run migrate:users-soft-delete
 */

require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');

const run = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');

  const users = mongoose.connection.collection('users');

  const result = await users.updateMany(
    {
      $or: [
        { isDeleted: { $exists: false } },
        { deletedAt: { $exists: false } },
      ],
    },
    {
      $set: {
        isDeleted: false,
        deletedAt: null,
      },
    }
  );

  console.log(
    `Users updated: matched=${result.matchedCount}, modified=${result.modifiedCount}`
  );

  const indexes = await users.indexes();
  const emailIndexes = indexes.filter(
    (index) => index.key && index.key.email === 1
  );

  for (const index of emailIndexes) {
    const isPartialSoftDelete =
      index.partialFilterExpression &&
      index.partialFilterExpression.isDeleted === false;

    if (index.name !== '_id_' && !isPartialSoftDelete) {
      console.log(`Dropping old email index: ${index.name}`);
      await users.dropIndex(index.name);
    }
  }

  await users.createIndex(
    { email: 1 },
    {
      unique: true,
      partialFilterExpression: { isDeleted: false },
      name: 'email_1_active_users',
    }
  );
  console.log('Ensured partial unique email index for non-deleted users');

  await mongoose.disconnect();
  console.log('Migration completed');
};

run().catch(async (err) => {
  console.error('Migration failed', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
