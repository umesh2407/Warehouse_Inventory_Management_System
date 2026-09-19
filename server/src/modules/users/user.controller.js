const userService = require('./user.service');
const asyncHandler = require('../../common/asyncHandler');
const { sendSuccess } = require('../../common/response');

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendSuccess(res, 201, 'User created successfully', user);
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  return sendSuccess(res, 200, 'Users retrieved successfully', users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, 200, 'User retrieved successfully', user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user);
  return sendSuccess(res, 200, 'User updated successfully', user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.deleteUser(req.params.id, req.user);
  return sendSuccess(res, 200, 'User deleted successfully', user);
});

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
};
