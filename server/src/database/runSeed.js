require('dotenv').config({ quiet: true });

const connectDB = require('../config/db');
const seedAdmin = require('./seed');

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  }
};

run();
