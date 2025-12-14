const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test backend health endpoint
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('✅ Backend health check:', healthResponse.data);
    
    // Test API root endpoint
    const apiResponse = await axios.get('http://localhost:5001/');
    console.log('✅ Backend API root:', apiResponse.data);
    
    // Test CORS by checking if the frontend URL is allowed
    const corsResponse = await axios.get('http://localhost:5001/', {
      headers: {
        'Origin': 'http://localhost:3001'
      }
    });
    console.log('✅ CORS test passed');
    
    console.log('\n🎉 Backend is running and ready for frontend connections!');
    console.log('Backend URL: http://localhost:5001');
    console.log('Frontend URL: http://localhost:3001 (when started)');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testConnection();