// routes.test.js
const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const { router } = require('../routes');
const { connect } = require('../database');
const authMiddleware = require('../authMiddleware');

// Mock the authMiddleware to always pass
jest.mock('../authMiddleware', () => (req, res, next) => next());

// Mock the database connection and methods
jest.mock('../database', () => ({
  connect: () => ({
    collection: jest.fn(() => ({
      updateOne: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
    })),
  }),
}));

// Create an instance of express and use the router under test
const app = express();
app.use(express.json());
app.use('/api', router);

describe('API routes', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('/saveRecentEssay saves essay data', async () => {
    const mockEssayData = { essay: 'Test Essay', thesis: 'Test Thesis', premises: ['Test Premise'], selections: [] };
    connect().collection().updateOne.mockResolvedValue({ result: { nModified: 1 } });

    const response = await request(app)
      .post('/api/saveRecentEssay')
      .send(mockEssayData);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('saved successfully');
  });

  test('/getRecentEssay retrieves essay data', async () => {
    const mockEssayData = { essay: 'Test Essay', thesis: 'Test Thesis', premises: ['Test Premise'], selections: [] };
    mockFindOne.mockResolvedValue({ recentEssay: mockEssayData });

    const response = await request(app)
      .get('/api/getRecentEssay')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockEssayData);
    expect(mockFindOne).toHaveBeenCalled();
  });

  test('/clearSelections clears essay data', async () => {
    mockUpdateOne.mockResolvedValue({ result: { nModified: 1 } });

    const response = await request(app)
      .post('/api/clearSelections')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('cleared');
    expect(mockUpdateOne).toHaveBeenCalled();
  });
});

module.exports = { app };
