const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test Sweet API endpoint
    const sweetResponse = await axios.get('http://localhost:5004/api/Sweet');
    console.log('✅ Sweet API working:', sweetResponse.data);
    
    // Test API root endpoint
    const apiResponse = await axios.get('http://localhost:5004/');
    console.log('✅ Backend API root:', apiResponse.data);
    
    console.log('\n🎉 Backend is running and ready for frontend connections!');
    console.log('Backend URL: http://localhost:5004');
    console.log('Frontend URL: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testConnection();