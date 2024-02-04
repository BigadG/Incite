require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { router } = require('../routes');
const authMiddleware = require('../authMiddleware');
const bodyParser = require('body-parser');

jest.mock('../openaiService', () => ({
  generateEssayContent: jest.fn().mockImplementation((prompts, contentFromPages) => {
    return Promise.resolve(`Generated essay based on prompts: ${prompts} and content: ${contentFromPages}`);
  })
}));

// Creating a new express application for tests to avoid EADDRINUSE error
const testApp = express();
testApp.use(bodyParser.json());
testApp.use(authMiddleware);
testApp.use('/api', router);

// Mock database connection
jest.mock('../database', () => ({
  connect: jest.fn().mockResolvedValue({
    collection: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockResolvedValue({ uuid: 'mock-uuid' }),
    updateOne: jest.fn().mockResolvedValue({}),
    insertOne: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({}),
  }),
}));

describe('User Selections', () => {
  let server;

  beforeAll(() => {
    // Listen on a random port
    server = testApp.listen();
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should add a selection', async () => {
    const response = await request(server)
      .post('/api/addSelection')
      .set('Authorization', `Bearer mock-uuid`)
      .send({ title: 'Test Title', url: 'http://test.com' });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Selection added');
  });
});