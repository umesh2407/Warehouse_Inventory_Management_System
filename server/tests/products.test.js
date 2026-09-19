const request = require('supertest');
const app = require('../src/app');
const {
  authHeader,
  createAdminAndToken,
  createStaffAndToken,
} = require('./helpers/auth');

describe('Products', () => {
  const productPayload = {
    name: 'Laptop',
    sku: 'LAP-001',
    category: 'Electronics',
    price: 50000,
    minimumStockLevel: 10,
  };

  test('Admin can create, list, update, and search products', async () => {
    const { token } = await createAdminAndToken();

    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send(productPayload);

    expect(created.status).toBe(201);
    expect(created.body.data.sku).toBe('LAP-001');

    const listed = await request(app)
      .get('/api/v1/products?search=laptop')
      .set(authHeader(token));

    expect(listed.status).toBe(200);
    expect(listed.body.data.items).toHaveLength(1);

    const updated = await request(app)
      .patch(`/api/v1/products/${created.body.data.id}`)
      .set(authHeader(token))
      .send({ price: 45000 });

    expect(updated.status).toBe(200);
    expect(updated.body.data.price).toBe(45000);
  });

  test('Duplicate SKU returns 409', async () => {
    const { token } = await createAdminAndToken();

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send(productPayload);

    const duplicate = await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send(productPayload);

    expect(duplicate.status).toBe(409);
  });

  test('Staff can view but cannot create products', async () => {
    const { token: adminToken } = await createAdminAndToken();
    const { token: staffToken } = await createStaffAndToken();

    await request(app)
      .post('/api/v1/products')
      .set(authHeader(adminToken))
      .send(productPayload);

    const list = await request(app)
      .get('/api/v1/products')
      .set(authHeader(staffToken));
    expect(list.status).toBe(200);

    const create = await request(app)
      .post('/api/v1/products')
      .set(authHeader(staffToken))
      .send({ ...productPayload, sku: 'LAP-002' });
    expect(create.status).toBe(403);
  });

  test('Soft delete is blocked when stock exists', async () => {
    const { token } = await createAdminAndToken();

    const product = await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send(productPayload);

    const warehouse = await request(app)
      .post('/api/v1/warehouses')
      .set(authHeader(token))
      .send({
        name: 'Main Warehouse',
        location: 'Ahmedabad',
        capacity: 1000,
      });

    await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: product.body.data.id,
        warehouseId: warehouse.body.data.id,
        quantity: 5,
      });

    const blocked = await request(app)
      .delete(`/api/v1/products/${product.body.data.id}`)
      .set(authHeader(token));

    expect(blocked.status).toBe(422);

    await request(app)
      .post('/api/v1/inventory/remove')
      .set(authHeader(token))
      .send({
        productId: product.body.data.id,
        warehouseId: warehouse.body.data.id,
        quantity: 5,
      });

    const deleted = await request(app)
      .delete(`/api/v1/products/${product.body.data.id}`)
      .set(authHeader(token));

    expect(deleted.status).toBe(200);
  });
});
