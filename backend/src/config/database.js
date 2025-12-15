const mongoose = require('mongoose');

// Connect to a real MongoDB URI or fall back to an in-memory server
// when running locally without a hosted DB. Set USE_IN_MEMORY_DB=true
// to force the in-memory server.
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Try to connect to local MongoDB first, fallback to in-memory if needed
    if (!mongoUri) {
      try {
        // Try connecting to local MongoDB
        mongoUri = 'mongodb://localhost:27017/sweetshop';
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log('Connected to local MongoDB');
        return;
      } catch (error) {
        console.log('Local MongoDB not available, using in-memory database');
      }
    }

    if (!mongoUri || process.env.USE_IN_MEMORY_DB === 'true') {
      // Lazy-load mongodb-memory-server only when needed
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('Using in-memory MongoDB for local run');
    }

    const conn = await mongoose.connect(mongoUri, {
      // mongoose v6+ ignores these options, but keep for backward compat
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;