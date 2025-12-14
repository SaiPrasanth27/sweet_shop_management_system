require('./setup');

const request = require('supertest');
const app = require('../src/app');
const Sweet = require('../src/models/Sweet');

describe('RED 2: GET /api/sweets?category=', () => {

  beforeEach(async () => {
    await Sweet.create([
      {
        name: 'Chocolate Cake',
        description: 'Cake',
        price: 20,
        category: 'cakes',
        stock: 5
      },
      {
        name: 'Chocolate Bar',
        description: 'Chocolate',
        price: 5,
        category: 'chocolates',
        stock: 10
      }
    ]);
  });

  it('should return only sweets matching category', async () => {
    const res = await request(app)
      .get('/api/Sweet?category=cakes')
      .expect(200);

    expect(res.body.sweets.length).toBe(1);
    expect(res.body.sweets[0].category).toBe('cakes');
  });
});
