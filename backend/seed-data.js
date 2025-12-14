const mongoose = require('mongoose');
const Sweet = require('./src/models/Sweet');
const User = require('./src/models/User');
require('dotenv').config();

const sampleSweets = [
  {
    name: 'Dark Chocolate Truffle',
    description: 'Rich and creamy dark chocolate truffle with cocoa powder coating',
    price: 25.99,
    category: 'Chocolate',
    quantity: 50
  },
  {
    name: 'Strawberry Gummy Bears',
    description: 'Soft and chewy gummy bears with natural strawberry flavor',
    price: 12.50,
    category: 'Gummy',
    quantity: 100
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Freshly baked cookies with premium chocolate chips',
    price: 18.75,
    category: 'Cookies',
    quantity: 75
  },
  {
    name: 'Red Velvet Cake Slice',
    description: 'Moist red velvet cake with cream cheese frosting',
    price: 45.00,
    category: 'Cakes',
    quantity: 20
  },
  {
    name: 'Peppermint Hard Candy',
    description: 'Classic peppermint hard candy with refreshing taste',
    price: 8.99,
    category: 'Hard Candy',
    quantity: 200
  },
  {
    name: 'Mixed Fruit Jellies',
    description: 'Assorted fruit-flavored jelly candies',
    price: 15.25,
    category: 'Other',
    quantity: 80
  }
];

const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@sweetshop.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'customer1',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer'
  }
];

async function seedData() {
  try {
    // Connect to database
    let mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || process.env.USE_IN_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('Using in-memory MongoDB for seeding');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Sweet.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample data
    const createdSweets = await Sweet.insertMany(sampleSweets);
    console.log(`Created ${createdSweets.length} sweets`);

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`Created ${createdUsers.length} users`);

    console.log('Sample data seeded successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin@sweetshop.com / admin123');
    console.log('Customer: customer@example.com / password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };