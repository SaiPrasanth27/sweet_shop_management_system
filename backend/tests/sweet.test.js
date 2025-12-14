const request = require('supertest');
const app = require('../src/app');
const Sweet = require('../src/models/Sweet');

describe('RED 1: GET /api/sweets', () => {
  beforeEach(async () => {
    await Sweet.create({
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake',
      price: 25.99,
      category: 'cakes',
      stock: 10,
      imageFilename: 'cake.jpg'
    });
  });

  it('should return list of sweets', async () => {
    const res = await request(app)
      .get('/api/sweets')
      .expect(200);

    expect(res.body).toHaveProperty('sweets');
    expect(res.body.sweets.length).toBe(1);
    expect(res.body.sweets[0]).toHaveProperty('name', 'Chocolate Cake');
  });
});
