import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || '';

    // Don't force-redirect to login when the failure is from auth endpoints
    // (e.g. invalid credentials on /auth/login or failures on /auth/register).
    const isAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register') || reqUrl.includes('/auth/me');

    if (status === 401 && !isAuthEndpoint) {
      try { localStorage.removeItem('token'); } catch (e) {}
      // navigate to login page but avoid full page reload in dev flow
      try { window.location.href = '/login'; } catch (e) {}
    }

    return Promise.reject(error);
  }
);

const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  logout() {
    localStorage.removeItem('token');
  }
};

export default authService;