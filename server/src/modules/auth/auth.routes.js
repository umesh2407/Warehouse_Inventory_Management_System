const express = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const { loginSchema } = require('./auth.validation');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
