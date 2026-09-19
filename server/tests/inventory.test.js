const request = require('supertest');
const app = require('../src/app');
const {
  authHeader,
  createAdminAndToken,
  createStaffAndToken,
} = require('./helpers/auth');

const seedCatalog = async (token) => {
  const product = await request(app)
    .post('/api/v1/products')
    .set(authHeader(token))
    .send({
      name: 'Laptop',
      sku: 'LAP-001',
      category: 'Electronics',
      price: 50000,
      minimumStockLevel: 20,
    });

  const source = await request(app)
    .post('/api/v1/warehouses')
    .set(authHeader(token))
    .send({
      name: 'Source Warehouse',
      location: 'Ahmedabad',
      capacity: 100,
    });

  const destination = await request(app)
    .post('/api/v1/warehouses')
    .set(authHeader(token))
    .send({
      name: 'Destination Warehouse',
      location: 'Surat',
      capacity: 50,
    });

  return {
    productId: product.body.data.id,
    sourceWarehouseId: source.body.data.id,
    destinationWarehouseId: destination.body.data.id,
  };
};

describe('Inventory', () => {
  test('Staff can add, remove, and transfer stock', async () => {
    const { token: adminToken } = await createAdminAndToken();
    const { token: staffToken } = await createStaffAndToken();
    const ids = await seedCatalog(adminToken);

    const added = await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(staffToken))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 30,
      });

    expect(added.status).toBe(200);
    expect(added.body.data.quantity).toBe(30);

    const transferred = await request(app)
      .post('/api/v1/inventory/transfer')
      .set(authHeader(staffToken))
      .send({
        productId: ids.productId,
        sourceWarehouseId: ids.sourceWarehouseId,
        destinationWarehouseId: ids.destinationWarehouseId,
        quantity: 10,
      });

    expect(transferred.status).toBe(200);
    expect(transferred.body.data.source.quantity).toBe(20);
    expect(transferred.body.data.destination.quantity).toBe(10);

    const removed = await request(app)
      .post('/api/v1/inventory/remove')
      .set(authHeader(staffToken))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 5,
      });

    expect(removed.status).toBe(200);
    expect(removed.body.data.quantity).toBe(15);
  });

  test('Insufficient stock and same-warehouse transfer are rejected', async () => {
    const { token } = await createAdminAndToken();
    const ids = await seedCatalog(token);

    await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 5,
      });

    const insufficient = await request(app)
      .post('/api/v1/inventory/remove')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 10,
      });

    expect(insufficient.status).toBe(422);
    expect(insufficient.body.message).toBe('Insufficient stock available');

    const sameWarehouse = await request(app)
      .post('/api/v1/inventory/transfer')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        sourceWarehouseId: ids.sourceWarehouseId,
        destinationWarehouseId: ids.sourceWarehouseId,
        quantity: 1,
      });

    expect(sameWarehouse.status).toBe(422);
  });

  test('Capacity hard limit is enforced on add', async () => {
    const { token } = await createAdminAndToken();
    const ids = await seedCatalog(token);

    const overCapacity = await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.destinationWarehouseId,
        quantity: 51,
      });

    expect(overCapacity.status).toBe(422);
    expect(overCapacity.body.message).toBe('Warehouse capacity exceeded');
  });

  test('Zero or negative quantity is rejected', async () => {
    const { token } = await createAdminAndToken();
    const ids = await seedCatalog(token);

    const res = await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 0,
      });

    expect(res.status).toBe(400);
  });

  test('Concurrent removes do not allow negative stock', async () => {
    const { token } = await createAdminAndToken();
    const ids = await seedCatalog(token);

    await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 10,
      });

    const results = await Promise.all([
      request(app)
        .post('/api/v1/inventory/remove')
        .set(authHeader(token))
        .send({
          productId: ids.productId,
          warehouseId: ids.sourceWarehouseId,
          quantity: 8,
        }),
      request(app)
        .post('/api/v1/inventory/remove')
        .set(authHeader(token))
        .send({
          productId: ids.productId,
          warehouseId: ids.sourceWarehouseId,
          quantity: 8,
        }),
    ]);

    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toEqual([200, 422]);

    const inventory = await request(app)
      .get(`/api/v1/inventory?productId=${ids.productId}&warehouseId=${ids.sourceWarehouseId}`)
      .set(authHeader(token));

    expect(inventory.body.data.items[0].quantity).toBe(2);
  });

  test('Low-stock endpoint uses total stock across warehouses', async () => {
    const { token } = await createAdminAndToken();
    const ids = await seedCatalog(token);

    await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 5,
      });

    await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.destinationWarehouseId,
        quantity: 7,
      });

    const lowStock = await request(app)
      .get('/api/v1/inventory/low-stock')
      .set(authHeader(token));

    expect(lowStock.status).toBe(200);
    expect(lowStock.body.data).toHaveLength(1);
    expect(lowStock.body.data[0].totalStock).toBe(12);
    expect(lowStock.body.data[0].minimumStockLevel).toBe(20);
  });
});

describe('Dashboard', () => {
  test('GET /dashboard/summary returns expected metrics', async () => {
    const { token } = await createAdminAndToken();
    const ids = await seedCatalog(token);

    await request(app)
      .post('/api/v1/inventory/add')
      .set(authHeader(token))
      .send({
        productId: ids.productId,
        warehouseId: ids.sourceWarehouseId,
        quantity: 5,
      });

    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      totalProducts: 1,
      totalWarehouses: 2,
      totalStockQuantity: 5,
      lowStockProducts: 1,
    });
  });
});
