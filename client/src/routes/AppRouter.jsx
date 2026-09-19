import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { LoginPage } from '../modules/auth/LoginPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { InventoryPage } from '../modules/inventory/InventoryPage';
import { ProductsPage } from '../modules/products/ProductsPage';
import { UsersPage } from '../modules/users/UsersPage';
import { WarehousesPage } from '../modules/warehouses/WarehousesPage';
import { AdminRoute, GuestRoute, ProtectedRoute } from './ProtectedRoute';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="warehouses" element={<WarehousesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route element={<AdminRoute />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
