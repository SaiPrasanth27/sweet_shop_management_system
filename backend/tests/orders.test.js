require('./setup');

const request = require('supertest');
const app = require('../src/app');
const Order = require('../src/models/Order');
const Sweet = require('../src/models/Sweet');
const User = require('../src/models/User');

jest.setTimeout(30000);

describe('Order System', () => {
  let customerToken, adminToken, customer, admin, sweet1, sweet2;

  beforeEach(async () => {
    // Create users
    customer = await User.create({
      username: 'customer',
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer'
    });

    admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Get tokens
    const customerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'password123' });
    customerToken = customerLogin.body.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    // Create test sweets
    sweet1 = await Sweet.create({
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake',
      price: 25.99,
      category: 'Cakes',
      quantity: 10,
      imageFilename: 'chocolate-cake.jpg'
    });

    sweet2 = await Sweet.create({
      name: 'Vanilla Cupcake',
      description: 'Sweet vanilla cupcake',
      price: 5.99,
      category: 'Cakes',
      quantity: 20,
      imageFilename: 'vanilla-cupcake.jpg'
    });
  });

  describe('Order Model', () => {
    it('should create a valid order', async () => {
      const orderData = {
        user: customer._id,
        items: [
          {
            sweet: sweet1._id,
            name: sweet1.name,
            price: sweet1.price,
            quantity: 2
          }
        ],
        totalAmount: 51.98,
        orderNumber: 'ORD-001',
        totalItems: 2,
        status: 'ordered'
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.user.toString()).toBe(customer._id.toString());
      expect(savedOrder.items).toHaveLength(1);
      expect(savedOrder.totalAmount).toBe(51.98);
      expect(savedOrder.status).toBe('ordered');
    });

    it('should validate required fields', async () => {
      const order = new Order({});
      await expect(order.save()).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const orderData = {
        user: customer._id,
        items: [{
          sweet: sweet1._id,
          name: sweet1.name,
          price: sweet1.price,
          quantity: 1
        }],
        totalAmount: 25.99,
        orderNumber: 'ORD-001',
        totalItems: 1,
        status: 'invalid-status'
      };

      const order = new Order(orderData);
      await expect(order.save()).rejects.toThrow();
    });
  });

  describe('POST /api/orders', () => {
    it('should create order from direct purchase', async () => {
      const orderData = {
        items: [
          {
            sweet: sweet1._id,
            quantity: 2
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Order created successfully');
      expect(response.body).toHaveProperty('order');
      expect(response.body.order.items).toHaveLength(1);
      expect(response.body.order.totalAmount).toBe(51.98);
      expect(response.body.order.status).toBe('ordered');
    });

    it('should return 401 without authentication', async () => {
      const orderData = {
        items: [{ sweet: sweet1._id, quantity: 1 }]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      await Order.create([
        {
          user: customer._id,
          items: [{
            sweet: sweet1._id,
            name: sweet1.name,
            price: sweet1.price,
            quantity: 1
          }],
          totalAmount: 25.99,
          orderNumber: 'ORD-001',
          totalItems: 1,
          status: 'ordered'
        },
        {
          user: customer._id,
          items: [{
            sweet: sweet2._id,
            name: sweet2.name,
            price: sweet2.price,
            quantity: 2
          }],
          totalAmount: 11.98,
          orderNumber: 'ORD-002',
          totalItems: 2,
          status: 'received'
        }
      ]);
    });

    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(response.body.orders).toHaveLength(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    let order;

    beforeEach(async () => {
      order = await Order.create({
        user: customer._id,
        items: [{
          sweet: sweet1._id,
          name: sweet1.name,
          price: sweet1.price,
          quantity: 1
        }],
        totalAmount: 25.99,
        orderNumber: 'ORD-001',
        totalItems: 1,
        status: 'ordered'
      });
    });

    it('should cancel order', async () => {
      const response = await request(app)
        .put(`/api/orders/${order._id}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Order cancelled successfully');
      expect(response.body.order.status).toBe('cancelled');
      expect(response.body.order.totalAmount).toBe(0);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/orders/${fakeId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Order not found');
    });
  });
});
