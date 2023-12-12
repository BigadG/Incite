require('dotenv').config();
const request = require('supertest');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server.js');

let mongoServer;
let client;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  client = new MongoClient(uri);
  await client.connect();
  app.locals.db = client.db('InciteDB'); // Use the same DB name for consistency
}, 20000); // Increased timeout to 20 seconds

afterAll(async () => {
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 20000);

describe('/api/addSelection endpoint', () => {
  it('should save the current webpage to the user’s list', async () => {
    const mockUUID = 'mock-uuid-1234';
    const selectionData = { url: 'http://example.com', title: 'Example' };

    // Seed the database with the mock user ID
    const usersCollection = client.db('InciteDB').collection('Users');
    await usersCollection.insertOne({ uuid: mockUUID, selections: [] });

    const response = await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${mockUUID}`)
      .send(selectionData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Selection added');

    // Verify that the selection has been added to the database
    const user = await usersCollection.findOne({ uuid: mockUUID });
    expect(user).not.toBeNull();
    expect(user.selections).toEqual(expect.arrayContaining([expect.objectContaining(selectionData)]));
  });
});

