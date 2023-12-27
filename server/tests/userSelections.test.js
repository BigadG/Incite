require('dotenv').config();
const request = require('supertest');
const app = require('../server');

// Mock authMiddleware
jest.mock('../authMiddleware', () => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('Authorization header is missing');
      }

      const uuid = authHeader.split(' ')[1];
      if (!uuid) {
        throw new Error('UUID is missing');
      }

      // Bypassing actual database check for simplicity in tests
      req.userId = uuid;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
  };
});

// Mock database
jest.mock('../database', () => {
  const { MongoClient } = require('mongodb');
  const { MongoMemoryServer } = require('mongodb-memory-server');

  let mongoServer;
  let client;

  return {
    connect: async () => {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        client = new MongoClient(mongoUri);
        await client.connect();
      }
      return client.db('InciteTestDB');
    },
    close: async () => {
      if (client) {
        await client.close();
        client = null;
      }
      if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
      }
    },
  };
});


let db;
let authToken = 'mock-uuid-1234';

beforeAll(async () => {
  // Connect to the mocked database
  const database = require('../database');
  db = await database.connect();
}, 20000);

afterAll(async () => {
  // Close the mocked database
  const database = require('../database');
  await database.close();
}, 20000);

beforeEach(async () => {
  await db.collection('Users').deleteMany({});
  await db.collection('Users').insertOne({
    userId: authToken,
    selections: []
  });
});

afterEach(async () => {
  await db.collection('Users').deleteMany({});
});

describe('User Selections', () => {
  test('It should add a selection', async () => {
    const response = await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: authToken, title: 'Test Title', url: 'http://test.com' });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Selection added');
  });

  test('It should retrieve selections', async () => {
    await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: authToken, title: 'Test Title', url: 'http://test.com' });

    const response = await request(app)
      .get('/api/selections')
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ title: 'Test Title', url: 'http://test.com' })]));
  });

  test('It should clear selections', async () => {
    await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: authToken, title: 'Test Title', url: 'http://test.com' });

    const response = await request(app)
      .post('/api/clearSelections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: authToken });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Selections cleared');
  });
});



