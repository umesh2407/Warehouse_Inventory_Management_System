const User = require('./user.model');
const ApiError = require('../../common/ApiError');

const toSafeUser = (user) => user.toSafeObject();

const createUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  });

  return toSafeUser(user);
};

const listUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(toSafeUser);
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return toSafeUser(user);
};

const updateUser = async (id, updates) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (updates.name !== undefined) {
    user.name = updates.name;
  }
  if (updates.role !== undefined) {
    user.role = updates.role;
  }
  if (updates.isActive !== undefined) {
    user.isActive = updates.isActive;
  }

  await user.save();
  return toSafeUser(user);
};

const deactivateUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = false;
  await user.save();
  return toSafeUser(user);
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  toSafeUser,
};
