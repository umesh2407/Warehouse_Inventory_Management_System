const request = require('supertest');
const app = require('../src/app');
const {
  createUser,
  loginAs,
  authHeader,
  createAdminAndToken,
  createStaffAndToken,
} = require('./helpers/auth');
const { ROLES } = require('../src/common/constants');

describe('Auth', () => {
  test('POST /auth/login succeeds with valid credentials', async () => {
    await createUser({
      email: 'admin@test.com',
      password: 'AdminPass1!',
      role: ROLES.ADMIN,
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'AdminPass1!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin@test.com');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  test('POST /auth/login fails with invalid credentials', async () => {
    await createUser({
      email: 'admin@test.com',
      password: 'AdminPass1!',
      role: ROLES.ADMIN,
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /auth/me returns current user', async () => {
    const { token } = await createAdminAndToken();

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@test.com');
  });

  test('GET /auth/me rejects missing or invalid token', async () => {
    const missing = await request(app).get('/api/v1/auth/me');
    expect(missing.status).toBe(401);

    const invalid = await request(app)
      .get('/api/v1/auth/me')
      .set(authHeader('bad.token.value'));
    expect(invalid.status).toBe(401);
  });

  test('POST /auth/logout succeeds for authenticated user', async () => {
    const { token } = await createAdminAndToken();
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Users', () => {
  test('Admin can create warehouse staff', async () => {
    const { token } = await createAdminAndToken();

    const res = await request(app)
      .post('/api/v1/users')
      .set(authHeader(token))
      .send({
        name: 'New Staff',
        email: 'newstaff@test.com',
        password: 'StaffPass1!',
        role: ROLES.WAREHOUSE_STAFF,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe(ROLES.WAREHOUSE_STAFF);
  });

  test('Staff cannot create users', async () => {
    const { token } = await createStaffAndToken();

    const res = await request(app)
      .post('/api/v1/users')
      .set(authHeader(token))
      .send({
        name: 'Blocked',
        email: 'blocked@test.com',
        password: 'StaffPass1!',
        role: ROLES.WAREHOUSE_STAFF,
      });

    expect(res.status).toBe(403);
  });

  test('Admin can list and deactivate users', async () => {
    const { token } = await createAdminAndToken();
    await createUser({
      email: 'staff2@test.com',
      password: 'StaffPass1!',
      role: ROLES.WAREHOUSE_STAFF,
    });

    const list = await request(app)
      .get('/api/v1/users')
      .set(authHeader(token));
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(2);

    const staff = list.body.data.find((u) => u.email === 'staff2@test.com');
    const deactivated = await request(app)
      .delete(`/api/v1/users/${staff.id}`)
      .set(authHeader(token));

    expect(deactivated.status).toBe(200);
    expect(deactivated.body.data.isActive).toBe(false);

    const login = await loginAs('staff2@test.com', 'StaffPass1!');
    expect(login).toBeUndefined();
  });
});
