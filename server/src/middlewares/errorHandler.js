const ApiError = require('../common/ApiError');
const { sendError } = require('../common/response');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return sendError(res, 400, 'Validation failed', errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, 409, `Duplicate value for ${field}`);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid resource id');
  }

  if (env.nodeEnv !== 'production') {
    console.error(err);
  }

  return sendError(res, 500, 'Internal server error');
};

module.exports = errorHandler;
