const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a valid user with required fields', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer'
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

    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(50);
    });

    it('should set default role to customer', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await user.save();

      expect(user.role).toBe('customer');
    });
  });

  describe('User Validation', () => {
    it('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require email', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const userData1 = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      const userData2 = {
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'password456'
      };

      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalid-role'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
    });

    it('should have comparePassword method', () => {
      expect(typeof user.comparePassword).toBe('function');
    });

    it('should compare password correctly', async () => {
      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).toBe(false);
    });

    it('should have toJSON method that excludes password', () => {
      const userJSON = user.toJSON();
      
      expect(userJSON.password).toBeUndefined();
      expect(userJSON.username).toBe('testuser');
      expect(userJSON.email).toBe('test@example.com');
      expect(userJSON.role).toBe('customer');
    });
  });
});