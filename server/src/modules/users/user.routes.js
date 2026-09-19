const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { ROLES } = require('../../common/constants');
const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
} = require('./user.validation');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', validate(getUserSchema), userController.getUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', validate(getUserSchema), userController.deleteUser);

module.exports = router;
