import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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

const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(sweetId, quantity = 1) {
    const response = await api.post('/cart/add', { sweetId, quantity });
    return response.data;
  },

  async updateCartItem(sweetId, quantity) {
    const response = await api.put('/cart/update', { sweetId, quantity });
    return response.data;
  },

  async removeFromCart(sweetId) {
    const response = await api.delete(`/cart/remove/${sweetId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

export default cartService;