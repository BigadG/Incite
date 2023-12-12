require('dotenv').config();
const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');
const app = require('../server'); // Ensure this points to your Express app

jest.mock('../authMiddleware', () => ({
  authMiddleware: (req, res, next) => {
    try {
      const uuid = req.headers.authorization.split(' ')[1];
      if (uuid) {
        req.userId = uuid; // Attach the UUID to the request object
        next();
      } else {
        throw new Error('Authentication UUID is missing');
      }
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
  }
}));

jest.mock('../database', () => {
  const { MongoClient } = require('mongodb'); // Import MongoClient inside the mock
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

let mongoServer;
let db;
let authToken = 'mock-uuid-1234'; // Use a mock UUID

beforeAll(async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  db = new MongoClient(uri);
  await db.connect();
  await db.db("InciteTestDB").command({ ping: 1 });
});

afterAll(async () => {
  if (db) {
    await db.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  db = await require('../database').connect();
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
      .get(`/api/selections/${authToken}`)
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

