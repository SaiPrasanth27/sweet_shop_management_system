process.env.NODE_ENV = "test";

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const mongoose = require("mongoose");


jest.setTimeout(30000);


// Setup in-memory MongoDB server for testing
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;    

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  await User.init(); // Ensure indexes are created
});

// Tests for authentication routes
describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
      };
      // Send registration request
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Registration successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user).not.toHaveProperty('password');

      const user = await User.findById(response.body.user.id);
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
    });

    // Test duplicate email registration
    it('should return 400 for duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password456'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    // Test validation errors
    it('should return 400 for missing required fields', async () => {
      const testCases = [
        { email: 'test@example.com', password: 'password123' },
        { username: 'testuser', password: 'password123' },
        { username: 'testuser', email: 'test@example.com' },
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(testCase)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    // Test invalid email format
    it('should return 400 for invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // Tests for login route
  describe('POST /api/auth/login', () => {
    let testUser;

    beforeAll(async () => {
        await User.deleteMany();
  testUser = await User.create({
    username: "testuser",
    email: "test@example.com",
    password: "password123"
  });
});


    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user).not.toHaveProperty('password');

      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.role).toBe(testUser.role);
    });

    // Test invalid credentials
    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    // Test invalid password
    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});

// Close MongoDB connection after tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
