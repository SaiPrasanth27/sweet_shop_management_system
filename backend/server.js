const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // Optionally seed sample data when running with an in-memory DB
  try {
    if (process.env.SEED_ON_STARTUP === 'true') {
      const { seedData } = require('./seed-data');
      console.log('SEED_ON_STARTUP is true — seeding sample data');
      // seedData may create its own in-memory instance; when MONGODB_URI
      // is provided the seed will target the same DB and persist data.
      await seedData();
    }
  } catch (err) {
    console.error('Error during startup seeding:', err.message);
  }

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });
}

start();

module.exports = null;