require('./setup');

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const Sweet = require('../src/models/Sweet');
const User = require('../src/models/User');

describe('Sweet API Endpoints', () => {
  let adminToken, customerToken;

  // Create users and get tokens before each test so the global
  // test setup's `beforeEach` (which clears DB) doesn't remove them.
  beforeEach(async () => {
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    await User.create({
      username: 'customer',
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer'
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });
    customerToken = customerLogin.body.token;
  });

  describe('GET /api/Sweet', () => {
    beforeEach(async () => {
      await Sweet.create([
        {
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake',
          price: 25.99,
          category: 'cakes',
          stock: 10,
          imageFilename: 'cake.jpg'
        },
        {
          name: 'Vanilla Cupcake',
          description: 'Sweet vanilla cupcake',
          price: 5.99,
          category: 'cakes',
          stock: 20,
          imageFilename: 'cupcake.jpg'
        },
        {
          name: 'Chocolate Bar',
          description: 'Dark chocolate bar',
          price: 3.99,
          category: 'chocolates',
          stock: 50,
          imageFilename: 'bar.jpg'
        }
      ]);
    });

    it('should get all sweets', async () => {
      const res = await request(app).get('/api/Sweet').expect(200);
      expect(res.body.sweets).toHaveLength(3);
      expect(res.body.sweets[0]).toHaveProperty('imageUrl');
    });

    it('should filter sweets by category', async () => {
      const res = await request(app)
        .get('/api/Sweet?category=cakes')
        .expect(200);
      expect(res.body.sweets).toHaveLength(2);
    });

    it('should search sweets by name', async () => {
      const res = await request(app)
        .get('/api/Sweet?search=chocolate')
        .expect(200);
      expect(res.body.sweets).toHaveLength(2);
    });
  });

  describe('POST /api/Sweet', () => {
    it('should create sweet with admin token', async () => {
      const img = path.join(__dirname, 'test.jpg');
      fs.writeFileSync(img, 'fake image');

      const res = await request(app)
        .post('/api/Sweet')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'New Cake')
        .field('description', 'Delicious')
        .field('price', 10)
        .field('category', 'cakes')
        .field('stock', 5)
        .attach('image', img)
        .expect(201);

      fs.unlinkSync(img);
      expect(res.body.sweet).toHaveProperty('imageUrl');
    });

    it('should return 403 for customer', async () => {
      await request(app)
        .post('/api/Sweet')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({})
        .expect(403);
    });

    it('should return 401 without token', async () => {
      await request(app).post('/api/Sweet').send({}).expect(401);
    });
  });

  describe('PUT /api/Sweet/:id', () => {
    let sweet;
    beforeEach(async () => {
      sweet = await Sweet.create({
        name: 'Original',
        description: 'Desc',
        price: 10,
        category: 'cakes',
        stock: 5,
        imageFilename: 'x.jpg'
      });
    });

    it('should update sweet with admin', async () => {
      const res = await request(app)
        .put(`/api/Sweet/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated' })
        .expect(200);

      expect(res.body.sweet.name).toBe('Updated');
    });

    it('should return 403 for customer', async () => {
      await request(app)
        .put(`/api/Sweet/${sweet._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Fail' })
        .expect(403);
    });
  });

  describe('DELETE /api/Sweet/:id', () => {
    let sweet;
    beforeEach(async () => {
      sweet = await Sweet.create({
        name: 'Delete',
        description: 'Desc',
        price: 10,
        category: 'cakes',
        stock: 5,
        imageFilename: 'x.jpg'
      });
    });

    it('should delete sweet with admin', async () => {
      await request(app)
        .delete(`/api/Sweet/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(await Sweet.findById(sweet._id)).toBeNull();
    });

    it('should return 403 for customer', async () => {
      await request(app)
        .delete(`/api/Sweet/${sweet._id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });
});
