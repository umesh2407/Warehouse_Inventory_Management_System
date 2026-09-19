import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/auth/authSlice';
import dashboardReducer from '../modules/dashboard/dashboardSlice';
import inventoryReducer from '../modules/inventory/inventorySlice';
import productsReducer from '../modules/products/productsSlice';
import usersReducer from '../modules/users/usersSlice';
import warehousesReducer from '../modules/warehouses/warehousesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    warehouses: warehousesReducer,
    inventory: inventoryReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
  },
});
