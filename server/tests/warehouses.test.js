const request = require('supertest');
const app = require('../src/app');
const {
  authHeader,
  createAdminAndToken,
  createStaffAndToken,
} = require('./helpers/auth');

describe('Warehouses', () => {
  const warehousePayload = {
    name: 'Ahmedabad Warehouse',
    location: 'Ahmedabad',
    capacity: 1000,
  };

  test('Admin can create and update warehouses', async () => {
    const { token } = await createAdminAndToken();

    const created = await request(app)
      .post('/api/v1/warehouses')
      .set(authHeader(token))
      .send(warehousePayload);

    expect(created.status).toBe(201);

    const updated = await request(app)
      .patch(`/api/v1/warehouses/${created.body.data.id}`)
      .set(authHeader(token))
      .send({ capacity: 1500 });

    expect(updated.status).toBe(200);
    expect(updated.body.data.capacity).toBe(1500);
  });

  test('Duplicate warehouse names are rejected', async () => {
    const { token } = await createAdminAndToken();

    await request(app)
      .post('/api/v1/warehouses')
      .set(authHeader(token))
      .send(warehousePayload);

    const duplicate = await request(app)
      .post('/api/v1/warehouses')
      .set(authHeader(token))
      .send({ ...warehousePayload, name: 'ahmedabad warehouse' });

    expect(duplicate.status).toBe(409);
  });

  test('Staff cannot create warehouses', async () => {
    const { token } = await createStaffAndToken();

    const res = await request(app)
      .post('/api/v1/warehouses')
      .set(authHeader(token))
      .send(warehousePayload);

    expect(res.status).toBe(403);
  });

  test('Delete is blocked when warehouse has stock', async () => {
    const { token } = await createAdminAndToken();

    const product = await request(app)
      .post('/api/v1/products')
      .set(authHeader(token))
      .send({
        name: 'Laptop',
        sku: 'LAP-001',
        category: 'Electronics',
        price: 50000,
        minimumStockLevel: 10,
      });

    const warehouse = await request(app)
      .post('/api/v1/warehouses')
      .set(authHeader(token))
      .send(warehousePayload);

    await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: product.body.data.id,
        warehouseId: warehouse.body.data.id,
        quantity: 3,
      });

    const blocked = await request(app)
      .delete(`/api/v1/warehouses/${warehouse.body.data.id}`)
      .set(authHeader(token));

    expect(blocked.status).toBe(422);
  });

  test('Negative capacity is rejected', async () => {
    const { token } = await createAdminAndToken();

    const res = await request(app)
      .post('/api/v1/warehouses')
      .set(authHeader(token))
      .send({ ...warehousePayload, capacity: -1 });

    expect(res.status).toBe(400);
  });
});
