import api from './api';

export const listWarehousesRequest = (params) => api.get('/warehouses', { params });

export const getWarehouseByIdRequest = (id) => api.get(`/warehouses/${id}`);

export const createWarehouseRequest = (payload) => api.post('/warehouses', payload);

export const updateWarehouseRequest = (id, payload) =>
  api.patch(`/warehouses/${id}`, payload);

export const deleteWarehouseRequest = (id) => api.delete(`/warehouses/${id}`);
