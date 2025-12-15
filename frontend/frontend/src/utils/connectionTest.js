import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5004';

export const testConnection = async () => {
  try {
    console.log('Testing connection to:', API_BASE);
    
    // Test basic connection
    const response = await axios.get(`${API_BASE}/api/Sweet`, {
      timeout: 5000
    });
    
    console.log('✅ Connection successful:', response.data);
    return { success: true, data: response.data };
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return { 
        success: false, 
        error: 'Backend server is not running. Please start the backend server.' 
      };
    }
    
    if (error.code === 'ENOTFOUND') {
      return { 
        success: false, 
        error: 'Cannot reach backend server. Check the API URL configuration.' 
      };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

export const testAuth = async () => {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      username: 'testuser' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'customer'
    });
    
    console.log('✅ Auth test successful');
    return { success: true, token: response.data.token };
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message 
    };
  }
};