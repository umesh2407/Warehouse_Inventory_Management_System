const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/modules/users/user.model');
const { ROLES } = require('../../src/common/constants');

const createUser = async ({
  name = 'Test User',
  email,
  password = 'Password1!',
  role = ROLES.WAREHOUSE_STAFF,
} = {}) => {
  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
  });
  return { user, password };
};

const loginAs = async (email, password) => {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data?.token;
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const createAdminAndToken = async () => {
  const { password } = await createUser({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'AdminPass1!',
    role: ROLES.ADMIN,
  });
  const token = await loginAs('admin@test.com', password);
  return { token, password };
};

const createStaffAndToken = async () => {
  const { password } = await createUser({
    name: 'Staff User',
    email: 'staff@test.com',
    password: 'StaffPass1!',
    role: ROLES.WAREHOUSE_STAFF,
  });
  const token = await loginAs('staff@test.com', password);
  return { token, password };
};

module.exports = {
  createUser,
  loginAs,
  authHeader,
  createAdminAndToken,
  createStaffAndToken,
};
