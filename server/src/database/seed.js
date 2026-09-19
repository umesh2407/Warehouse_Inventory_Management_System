const User = require('../modules/users/user.model');
const env = require('../config/env');
const { ROLES } = require('../common/constants');

const seedAdmin = async () => {
  if (!env.adminEmail || !env.adminPassword) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment before seeding'
    );
  }

  const email = env.adminEmail.toLowerCase().trim();
  const existing = await User.findOne({ email, isDeleted: false });

  if (existing) {
    console.log('Admin already exists');
    return existing;
  }

  const passwordHash = await User.hashPassword(env.adminPassword);
  const admin = await User.create({
    name: env.adminName,
    email,
    passwordHash,
    role: ROLES.ADMIN,
  });

  console.log('Admin seeded successfully');
  return admin;
};

module.exports = seedAdmin;
