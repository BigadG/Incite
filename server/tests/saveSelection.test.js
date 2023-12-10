const request = require('supertest');
const app = require('../server');
const { MongoClient } = require('mongodb');

describe('POST /api/addSelection', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
    });
    db = await connection.db(global.__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
  });

  test('It should respond with a 200 status and confirmation message', async () => {
    const newSelection = {
      url: 'http://example.com',
      title: 'Example Website'
    };

    const response = await request(app)
      .post('/api/addSelection')
      .set('Authorization', `Bearer ${uuid}`)
      .send(newSelection);
    
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual('Selection added');
    
    // Verify the database was updated
    const selections = db.collection('Users').findOne({ uuid });
    expect(selections).toBeTruthy();
    expect(selections.selections).toContainEqual(expect.objectContaining(newSelection));
  });
});
