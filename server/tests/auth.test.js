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

  test('POST /auth/logout succeeds and clears auth cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', 'warehouse_token=dummy-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const setCookie = res.headers['set-cookie'] || [];
    expect(setCookie.join(';')).toMatch(/warehouse_token=/);
    expect(setCookie.join(';').toLowerCase()).toMatch(/max-age=0|expires=/);
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

  test('Admin can list and soft-delete staff users', async () => {
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
    const deleted = await request(app)
      .delete(`/api/v1/users/${staff.id}`)
      .set(authHeader(token));

    expect(deleted.status).toBe(200);
    expect(deleted.body.message).toBe('User deleted successfully');

    const listAfter = await request(app)
      .get('/api/v1/users')
      .set(authHeader(token));
    expect(listAfter.body.data.find((u) => u.email === 'staff2@test.com')).toBeUndefined();

    const getDeleted = await request(app)
      .get(`/api/v1/users/${staff.id}`)
      .set(authHeader(token));
    expect(getDeleted.status).toBe(404);

    const login = await loginAs('staff2@test.com', 'StaffPass1!');
    expect(login).toBeUndefined();
  });

  test('Cannot create another admin via API', async () => {
    const { token } = await createAdminAndToken();

    const res = await request(app)
      .post('/api/v1/users')
      .set(authHeader(token))
      .send({
        name: 'Second Admin',
        email: 'admin2@test.com',
        password: 'AdminPass1!',
        role: 'ADMIN',
      });

    // role is ignored/stripped by validation; user is created as staff if body is otherwise valid
    // sending unknown role field is stripped by zod, so create succeeds as staff
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.data.role).toBe(ROLES.WAREHOUSE_STAFF);
    }
  });

  test('Admin cannot change own role or status', async () => {
    const { token } = await createAdminAndToken();
    const me = await request(app).get('/api/v1/auth/me').set(authHeader(token));
    const adminId = me.body.data.id;

    const roleChange = await request(app)
      .patch(`/api/v1/users/${adminId}`)
      .set(authHeader(token))
      .send({ role: ROLES.WAREHOUSE_STAFF });

    expect(roleChange.status).toBe(403);

    const statusChange = await request(app)
      .patch(`/api/v1/users/${adminId}`)
      .set(authHeader(token))
      .send({ isActive: false });

    expect(statusChange.status).toBe(403);

    const selfDeactivate = await request(app)
      .delete(`/api/v1/users/${adminId}`)
      .set(authHeader(token));

    expect(selfDeactivate.status).toBe(403);
  });

  test('Admin can update own name only', async () => {
    const { token } = await createAdminAndToken();
    const me = await request(app).get('/api/v1/auth/me').set(authHeader(token));

    const res = await request(app)
      .patch(`/api/v1/users/${me.body.data.id}`)
      .set(authHeader(token))
      .send({ name: 'Updated Admin Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Admin Name');
    expect(res.body.data.role).toBe(ROLES.ADMIN);
  });
});
