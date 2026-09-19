const authService = require('./auth.service');
const asyncHandler = require('../../common/asyncHandler');
const { sendSuccess } = require('../../common/response');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, 200, 'Login successful', result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id || req.user._id);
  return sendSuccess(res, 200, 'Current user retrieved successfully', user);
});

const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Logout successful');
});

module.exports = {
  login,
  me,
  logout,
};
