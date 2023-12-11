const request = require('supertest');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server.js');

let mongoServer;
let db;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(InciteDB);
  app.locals.db = db;
});

afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('/api/addSelection endpoint', () => {
  it('should save the current webpage to the user’s list', async () => {
    const mockUUID = 'mock-uuid-1234';
    const selectionData = { url: 'http://example.com', title: 'Example' };

    const response = await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${mockUUID}`)
      .send(selectionData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Selection added');

    // Verify that the selection has been added to the database
    const user = await db.collection('Users').findOne({ uuid: mockUUID });
    expect(user.selections).toEqual(expect.arrayContaining([expect.objectContaining(selectionData)]));
  });
});

