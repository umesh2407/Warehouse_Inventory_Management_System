process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.ADMIN_EMAIL = 'test-admin@example.com';
process.env.ADMIN_PASSWORD = 'test-only-password';
process.env.ADMIN_NAME = 'Test Admin';

require('dotenv').config({ quiet: true, override: false });

const mongoose = require('mongoose');

const testDbName = `warehouse_inventory_test_${process.pid}`;

beforeAll(async () => {
  const baseUri = process.env.MONGO_URI;
  if (!baseUri) {
    throw new Error('MONGO_URI is required to run tests');
  }

  const connectUri = baseUri.replace(
    /^(mongodb(?:\+srv)?:\/\/[^/]+)\/([^?]+)/,
    `$1/${testDbName}`
  );

  process.env.MONGO_URI = connectUri;
  await mongoose.connect(connectUri);
}, 120000);

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
    await mongoose.disconnect();
  }
}, 60000);
