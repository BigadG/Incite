const request = require('supertest');
const app = require('../server');
const { connect, closeDatabase } = require('../database');

beforeAll(async () => await connect());
afterAll(async () => await closeDatabase());

describe('POST /api/addSelection', () => {
  it('should add a selection to the user\'s list', async () => {
    const uuid = 'test-uuid'; // Example UUID for testing
    const url = 'http://example.com';
    const title = 'Example Title';
    
    const response = await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${uuid}`)
      .send({ url, title });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Selection added');
  });
});
