const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');
const { sendSuccess } = require('./common/response');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const productRoutes = require('./modules/products/product.routes');
const warehouseRoutes = require('./modules/warehouses/warehouse.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  return sendSuccess(res, 200, 'OK', { status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [],
  });
});

app.use(errorHandler);

module.exports = app;
