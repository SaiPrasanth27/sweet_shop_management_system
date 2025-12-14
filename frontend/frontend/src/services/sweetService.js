import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const sweetService = {
  async getAllSweets(params = {}) {
    const response = await api.get('/sweets', { params });
    return response.data;
  },

  async getSweetById(id) {
    const response = await api.get(`/sweets/${id}`);
    return response.data;
  },

  async searchSweets(query, params = {}) {
    const response = await api.get('/sweets/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  async createSweet(sweetData) {
    const response = await api.post('/sweets', sweetData);
    return response.data;
  },

  async createSweetWithImage(formData) {
    const response = await api.post('/sweets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateSweet(id, sweetData) {
    const response = await api.put(`/sweets/${id}`, sweetData);
    return response.data;
  },

  async updateSweetWithImage(id, formData) {
    const response = await api.put(`/sweets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteSweet(id) {
    const response = await api.delete(`/sweets/${id}`);
    return response.data;
  },

  async purchaseSweet(id, quantity, notes = '') {
    const response = await api.post(`/sweets/${id}/purchase`, { quantity, notes });
    return response.data;
  },

  async restockSweet(id, quantity) {
    const response = await api.post(`/sweets/${id}/restock`, { quantity });
    return response.data;
  },

  async getSweetsByCategory(category, params = {}) {
    const response = await api.get(`/sweets/category/${category}`, { params });
    return response.data;
  }
};

export default sweetService;