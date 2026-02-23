import axios from 'axios';
import { storage } from '@/utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// In production: VITE_API_URL = https://backend.autorevives.com/api
// In development: falls back to /api (uses Vite proxy)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only force-logout when the JWT is genuinely expired or absent.
      // This prevents false logouts caused by proxy redirect issues.
      const token = storage.getToken();
      let shouldLogout = !token; // no token at all → logout

      if (token && !shouldLogout) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Token expired → legitimate logout
          if (payload.exp * 1000 < Date.now()) {
            shouldLogout = true;
          }
        } catch {
          // Malformed token → logout
          shouldLogout = true;
        }
      }

      if (shouldLogout) {
        storage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
