import api from './api';

export const listProductsRequest = (params) => api.get('/products', { params });

export const getProductByIdRequest = (id) => api.get(`/products/${id}`);

export const createProductRequest = (payload) => api.post('/products', payload);

export const updateProductRequest = (id, payload) => api.patch(`/products/${id}`, payload);

export const deleteProductRequest = (id) => api.delete(`/products/${id}`);
