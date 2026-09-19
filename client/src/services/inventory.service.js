import api from './api';

export const listInventoryRequest = (params) => api.get('/inventory', { params });

export const addStockRequest = (payload) => api.post('/inventory/add', payload);

export const removeStockRequest = (payload) => api.post('/inventory/remove', payload);

export const transferStockRequest = (payload) =>
  api.post('/inventory/transfer', payload);

export const getLowStockRequest = () => api.get('/inventory/low-stock');
