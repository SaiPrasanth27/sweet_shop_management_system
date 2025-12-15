import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const orderService = {
  async checkout(notes) {
    const response = await api.post('/orders/checkout', { notes });
    return response.data;
  },

  async getOrders(params = {}) {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getOrderByNumber(orderNumber) {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
  },

  async cancelOrder(orderNumber, reason) {
    const response = await api.put(`/orders/${orderNumber}/cancel`, { reason });
    return response.data;
  },

  async getOrderStats() {
    const response = await api.get('/orders/stats/summary');
    return response.data;
  },

  // Admin methods
  async getAllOrders(params = {}) {
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  },

  async updateOrderStatus(orderNumber, status) {
    const response = await api.put(`/orders/admin/${orderNumber}/status`, { status });
    return response.data;
  }
};

export default orderService;