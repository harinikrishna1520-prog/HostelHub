import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000/uploads';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostelhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, clear storage
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isLoginRequest) {
        localStorage.removeItem('hostelhub_token');
        localStorage.removeItem('hostelhub_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
