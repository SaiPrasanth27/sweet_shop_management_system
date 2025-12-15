// Quick script to add sample sweets via API
const axios = require('axios');

const sampleSweets = [
  {
    name: 'Dark Chocolate Truffle',
    description: 'Rich and creamy dark chocolate truffle',
    price: 25.99,
    category: 'Chocolate',
    quantity: 50
  },
  {
    name: 'Strawberry Gummy Bears',
    description: 'Soft and chewy gummy bears',
    price: 12.50,
    category: 'Gummy',
    quantity: 100
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Freshly baked cookies',
    price: 18.75,
    category: 'Cookies',
    quantity: 75
  }
];

async function addSweets() {
  try {
    console.log('Testing API connection...');
    const response = await axios.get('http://localhost:5004/api/Sweet');
    console.log('API connected! Current sweets:', response.data.sweets.length);
    
    if (response.data.sweets.length === 0) {
      console.log('No sweets found, but API is working!');
      console.log('You can add sweets through the admin panel');
    }
  } catch (error) {
    console.log('API Error:', error.message);
  }
}

addSweets();