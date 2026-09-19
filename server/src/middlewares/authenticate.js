const jwt = require('jsonwebtoken');
const ApiError = require('../common/ApiError');
const asyncHandler = require('../common/asyncHandler');
const env = require('../config/env');
const User = require('../modules/users/user.model');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = header.slice(7).trim();

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.sub).select('-passwordHash');

  if (!user || !user.isActive || user.isDeleted) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  req.user = user;
  next();
});

module.exports = authenticate;
