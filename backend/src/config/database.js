const mongoose = require('mongoose');

// Connect to a real MongoDB URI or fall back to an in-memory server
// when running locally without a hosted DB. Set USE_IN_MEMORY_DB=true
// to force the in-memory server.
const connectDB = async () => {
  try {
    // Log environment info for debugging
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
    console.log('USE_IN_MEMORY_DB:', process.env.USE_IN_MEMORY_DB);

    let mongoUri = process.env.MONGODB_URI;

    // In production, MONGODB_URI must be set
    if (process.env.NODE_ENV === 'production') {
      if (!mongoUri) {
        console.error('❌ MONGODB_URI environment variable is required in production');
        console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO')));
        throw new Error('MONGODB_URI environment variable is required in production');
      }
      console.log('✅ Using production MongoDB URI');
    }

    // For local development only
    if (!mongoUri && process.env.NODE_ENV !== 'production') {
      if (process.env.USE_IN_MEMORY_DB === 'true') {
        console.log('Using in-memory database for development');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
      } else {
        // Try local MongoDB first
        try {
          mongoUri = 'mongodb://localhost:27017/sweetshop';
          await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
          console.log('✅ Connected to local MongoDB');
          return;
        } catch (error) {
          console.log('Local MongoDB not available, using in-memory database');
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          mongoUri = mongod.getUri();
        }
      }
    }

    if (!mongoUri) {
      throw new Error('No MongoDB URI available');
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;