import api from './api';

export const loginRequest = (payload) => api.post('/auth/login', payload);

export const getMeRequest = () => api.get('/auth/me');

export const logoutRequest = () => api.post('/auth/logout');
