// server/tests/userSelections.test.js
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const app = require('../server'); // Ensure this points to your Express app

let mongoServer;
let db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  const client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db('InciteTestDB');

  // Replacing the connect method to use the in-memory server
  jest.mock('../database', () => ({
    connect: () => db
  }));
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('User Selections', () => {
  test('It should add a selection', async () => {
    // Mock auth if needed or add a test-specific middleware
    // ...

    const response = await request(app)
      .post('/api/add-selection')
      .send({ userId: 'testUserId', title: 'Test Title', url: 'http://test.com' })
      .expect(200);

    expect(response.body.message).toBe('Selection added');
    // Additional assertions as needed
  });

  test('It should retrieve selections', async () => {
    // Populate the database with a test entry
    // ...

    const response = await request(app)
      .get('/api/selections/testUserId')
      .expect(200);

    expect(response.body).toEqual([
      // Expected selections array
    ]);
  });

  test('It should clear selections', async () => {
    // Ensure there are selections to clear
    // ...

    const response = await request(app)
      .post('/api/clearSelections')
      .send({ userId: 'testUserId' })
      .expect(200);

    expect(response.body.message).toBe('Selections cleared');
    // Additional assertions as needed
  });
});
