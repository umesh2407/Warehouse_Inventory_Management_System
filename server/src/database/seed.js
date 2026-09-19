const User = require('../modules/users/user.model');
const env = require('../config/env');
const { ROLES } = require('../common/constants');

const seedAdmin = async () => {
  const email = env.adminEmail.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return existing;
  }

  const passwordHash = await User.hashPassword(env.adminPassword);
  const admin = await User.create({
    name: env.adminName,
    email,
    passwordHash,
    role: ROLES.ADMIN,
  });

  console.log(`Admin seeded: ${email}`);
  return admin;
};

module.exports = seedAdmin;
