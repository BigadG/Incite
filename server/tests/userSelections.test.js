// server/tests/userSelections.test.js
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = require('../server'); // Make sure this points to your Express app

jest.mock('../middleware/authMiddleware', () => ({
  authMiddleware: (req, res, next) => {
    // Mock user object
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }
}));

let mongoServer;
let db;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  const client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db('InciteTestDB');

  // Replace the actual connect method with the connection to the in-memory database
  jest.mock('../database', () => ({
    connect: () => db
  }));

  // Create a mock user and generate a test JWT
  const testUser = { userId: 'testUser', email: 'test@example.com' };
  authToken = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('User Selections', () => {
  beforeEach(async () => {
    await db.collection('Users').insertOne({
      userId: 'testUser',
      selections: []
    });
  });

  afterEach(async () => {
    await db.collection('Users').deleteMany({});
  });

  test('It should add a selection', async () => {
    const response = await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: 'testUser', title: 'Test Title', url: 'http://test.com' })
      .expect(200);

    expect(response.body.message).toBe('Selection added');
  });

  test('It should retrieve selections', async () => {
    await db.collection('Users').updateOne(
      { userId: 'testUser' },
      { $push: { selections: { title: 'Test Title', url: 'http://test.com', pageId: new ObjectId(), timestamp: new Date() } } }
    );

    const response = await request(app)
      .get('/api/selections/testUser')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ title: 'Test Title', url: 'http://test.com' })]));
  });

  test('It should clear selections', async () => {
    await db.collection('Users').updateOne(
      { userId: 'testUser' },
      { $set: { selections: [{ title: 'Test Title', url: 'http://test.com', pageId: new ObjectId(), timestamp: new Date() }] } }
    );

    const response = await request(app)
      .post('/api/clearSelections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: 'testUser' })
      .expect(200);

    expect(response.body.message).toBe('Selections cleared');
  });

  test('It should fail to add a selection without authentication', async () => {
    const response = await request(app)
      .post('/api/addSelection')
      .send({ userId: 'testUser', title: 'Test Title', url: 'http://test.com' })
      .expect(401);

    expect(response.body.message).toBe('Authentication failed');
  });

  test('It should handle errors when adding a selection with missing data', async () => {
    const response = await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: 'testUser', title: 'Test Title' }) // Missing URL
      .expect(400);

    expect(response.body.message).toContain('Missing url');
  });
});
