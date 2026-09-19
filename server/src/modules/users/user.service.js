const User = require('./user.model');
const ApiError = require('../../common/ApiError');
const { ROLES } = require('../../common/constants');

const toSafeUser = (user) => user.toSafeObject();

const isSameUser = (actor, targetId) =>
  actor._id.toString() === targetId.toString();

const findActiveUserById = async (id) => {
  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const createUser = async ({ name, email, password }) => {
  const existing = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });
  if (existing) {
    throw new ApiError(409, 'Email already in use');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: ROLES.WAREHOUSE_STAFF,
  });

  return toSafeUser(user);
};

const listUsers = async () => {
  const users = await User.find({ isDeleted: false }).sort({ createdAt: -1 });
  return users.map(toSafeUser);
};

const getUserById = async (id) => {
  const user = await findActiveUserById(id);
  return toSafeUser(user);
};

const updateUser = async (id, updates, actor) => {
  const user = await findActiveUserById(id);

  const editingSelf = isSameUser(actor, id);

  if (editingSelf && (updates.role !== undefined || updates.isActive !== undefined)) {
    throw new ApiError(403, 'You cannot change your own role or status');
  }

  if (user.role === ROLES.ADMIN && (updates.role !== undefined || updates.isActive !== undefined)) {
    throw new ApiError(403, 'Admin role and status cannot be changed');
  }

  if (updates.role !== undefined && updates.role === ROLES.ADMIN) {
    throw new ApiError(403, 'Cannot assign admin role. Only one admin is allowed');
  }

  if (updates.email !== undefined) {
    const email = updates.email.toLowerCase();
    const conflict = await User.findOne({
      email,
      isDeleted: false,
      _id: { $ne: id },
    });
    if (conflict) {
      throw new ApiError(409, 'Email already in use');
    }
    user.email = email;
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

const deleteUser = async (id, actor) => {
  const user = await findActiveUserById(id);

  if (isSameUser(actor, id)) {
    throw new ApiError(403, 'You cannot delete your own account');
  }

  if (user.role === ROLES.ADMIN) {
    throw new ApiError(403, 'Admin account cannot be deleted');
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.isActive = false;
  await user.save();

  return toSafeUser(user);
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  toSafeUser,
};
