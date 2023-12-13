require('dotenv').config();
const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('../server'); // Ensure this points to your Express app

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
      // Just attach UUID to the request object
      req.userId = uuid;

      // Pass control to the next middleware
      next();
    } catch (error) {
      // Respond with an error if UUID is missing or invalid
      res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
  };
});


jest.mock('../database', () => {
  const { MongoClient } = require('mongodb');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  let mongoServer;
  let db;

  return {
    connect: async () => {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const client = new MongoClient(mongoUri);
        await client.connect();
        db = client.db('InciteTestDB');
      }
      return db;
    },
    close: async () => {
      if (mongoServer) {
        await mongoServer.stop();
      }
    }
  };
});

let client;
let mongoServer;
let authToken = 'mock-uuid-1234'; // Use a mock UUID

beforeAll(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  client = new MongoClient(uri);
  await client.connect();
  await client.db("InciteTestDB").command({ ping: 1 });
});

afterAll(async () => {
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  const db = await require('../database').connect();
  await db.collection('Users').deleteMany({});
  await db.collection('Users').insertOne({
    userId: authToken,
    selections: []
  });
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
    // Add a selection first
    await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: authToken, title: 'Test Title', url: 'http://test.com' });

    const response = await request(app)
      .get('/api/selections') // Updated route
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ title: 'Test Title', url: 'http://test.com' })]));
  });

  test('It should clear selections', async () => {
    // Add a selection first
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

  test('It should fail to add a selection without authentication', async () => {
    const response = await request(app)
      .post('/api/addSelection')
      .send({ userId: authToken, title: 'Test Title', url: 'http://test.com' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication failed');
  });
});


