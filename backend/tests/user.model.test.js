// Force test environment
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../src/models/User");

// Increase timeout for Mongo + bcrypt
jest.setTimeout(30000);

let mongoServer;

/* ----------------------- */
/* Database Setup & Teardown */
/* ----------------------- */

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await User.init(); // ensure indexes (unique email)
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

/* ----------------------- */
/* User Model Tests */
/* ----------------------- */

describe("User Model", () => {

  /* ---------- User Creation ---------- */
  describe("User Creation", () => {

    it("should create a valid user with required fields", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "customer"
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it("should hash password before saving", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123"
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20);
    });

    it("should set default role to customer", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123"
      });

      await user.save();
      expect(user.role).toBe("customer");
    });
  });

  /* ---------- User Validation ---------- */
  describe("User Validation", () => {

    it("should require username", async () => {
      const user = new User({
        email: "test@example.com",
        password: "password123"
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should require email", async () => {
      const user = new User({
        username: "testuser",
        password: "password123"
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should require password", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com"
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should validate email format", async () => {
      const user = new User({
        username: "testuser",
        email: "invalid-email",
        password: "password123"
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should enforce unique email", async () => {
      const user1 = new User({
        username: "user1",
        email: "duplicate@example.com",
        password: "password123"
      });

      const user2 = new User({
        username: "user2",
        email: "duplicate@example.com",
        password: "password456"
      });

      await user1.save();
      await expect(user2.save()).rejects.toThrow();
    });

    it("should validate role enum", async () => {
      const user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        role: "invalid-role"
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  /* ---------- User Methods ---------- */
  describe("User Methods", () => {
    let user;

    beforeEach(async () => {
      user = new User({
        username: "testuser",
        email: "test@example.com",
        password: "password123"
      });
      await user.save();
    });

    it("should have comparePassword method", () => {
      expect(typeof user.comparePassword).toBe("function");
    });

    it("should compare password correctly", async () => {
      const isMatch = await user.comparePassword("password123");
      expect(isMatch).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const isMatch = await user.comparePassword("wrongpassword");
      expect(isMatch).toBe(false);
    });

    it("should have toJSON method that excludes password", () => {
      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.username).toBe("testuser");
      expect(userJSON.email).toBe("test@example.com");
      expect(userJSON.role).toBe("customer");
    });
  });
});
