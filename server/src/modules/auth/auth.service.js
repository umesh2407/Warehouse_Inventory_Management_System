const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const { toSafeUser } = require('../users/user.service');
const ApiError = require('../../common/ApiError');
const env = require('../../config/env');

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

  if (!user || !user.isActive || user.isDeleted) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    user: toSafeUser(user),
    token,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive || user.isDeleted) {
    throw new ApiError(401, 'Invalid or expired token');
  }
  return toSafeUser(user);
};

module.exports = {
  login,
  getCurrentUser,
};
