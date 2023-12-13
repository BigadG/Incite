require('dotenv').config();
const request = require('supertest');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
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


let client;
let mongoServer;
let authToken = 'mock-uuid-1234'; // Use a mock UUID

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  client = new MongoClient(uri);
  await client.connect();
}, 20000); // Increase the timeout for beforeAll


// Mock database
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
        client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('InciteTestDB');
        return db;
      }
      return client.db('InciteTestDB');
    },
    close: async () => {
      if (client) {
        await client.close();
        client = null; // Set to null to indicate it's closed
      }
      if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null; // Set to null to indicate it's stopped
      }
    }
  };
});

afterAll(async () => {
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  jest.restoreAllMocks();
}, 20000); // Increase the timeout for afterAll

beforeEach(async () => {
  const db = await client.db("InciteTestDB");
  await db.collection('Users').deleteMany({});
  await db.collection('Users').insertOne({
    userId: authToken,
    selections: []
  });
});

afterEach(async () => {
  const db = await client.db("InciteTestDB");
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


