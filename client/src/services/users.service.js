import api from './api';

export const listUsersRequest = () => api.get('/users');

export const createUserRequest = (payload) => api.post('/users', payload);

export const getUserByIdRequest = (id) => api.get(`/users/${id}`);

export const updateUserRequest = (id, payload) => api.patch(`/users/${id}`, payload);

export const deactivateUserRequest = (id) => api.delete(`/users/${id}`);
