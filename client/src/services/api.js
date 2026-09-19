import axios from 'axios';
import { toast } from 'react-toastify';
import { clearAuthToken, getAuthToken } from '../utils/cookies';
import { getErrorMessage, isValidationError } from '../utils/error';

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    const message = response.data?.message;

    if (MUTATING_METHODS.has(method) && message) {
      toast.success(message);
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const method = error.config?.method?.toLowerCase();
    const onLoginPage = window.location.pathname.includes('/login');

    // 422 validation errors stay inline in forms — no toast.
    if (isValidationError(error)) {
      return Promise.reject(error);
    }

    if (status === 401) {
      clearAuthToken();
      toast.error(getErrorMessage(error, 'Session expired. Please sign in again.'));
      if (!onLoginPage) {
        window.location.assign('/login');
      }
      return Promise.reject(error);
    }

    // Toast all other API / network errors (mutations and fetches).
    if (method || error.message) {
      toast.error(getErrorMessage(error, 'Something went wrong'));
    }

    return Promise.reject(error);
  }
);

export default api;
