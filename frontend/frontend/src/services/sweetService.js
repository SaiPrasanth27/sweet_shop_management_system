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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Sweet Service API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const sweetService = {
  async getAllSweets(params = {}) {
    const response = await api.get('/Sweet', { params });
    return response.data;
  },

  async getSweetById(id) {
    const response = await api.get(`/Sweet/${id}`);
    return response.data;
  },

  async searchSweets(query, params = {}) {
    const response = await api.get('/Sweet/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  async createSweet(sweetData) {
    const response = await api.post('/Sweet', sweetData);
    return response.data;
  },

  async createSweetWithImage(sweetData) {
    const response = await api.post('/Sweet', sweetData);
    return response.data;
  },

  async updateSweet(id, sweetData) {
    const response = await api.put(`/Sweet/${id}`, sweetData);
    return response.data;
  },

  async updateSweetWithImage(id, sweetData) {
    const response = await api.put(`/Sweet/${id}`, sweetData);
    return response.data;
  },

  async deleteSweet(id) {
    const response = await api.delete(`/Sweet/${id}`);
    return response.data;
  },

  async purchaseSweet(id, quantity, notes = '') {
    const response = await api.post(`/Sweet/${id}/purchase`, { quantity, notes });
    return response.data;
  },

  async restockSweet(id, quantity) {
    const response = await api.post(`/Sweet/${id}/restock`, { quantity });
    return response.data;
  },

  async getSweetsByCategory(category, params = {}) {
    const response = await api.get(`/Sweet/category/${category}`, { params });
    return response.data;
  }
};

export default sweetService;