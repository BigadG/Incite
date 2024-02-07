const request = require('supertest');
const express = require('express');
const { router } = require('../routes');
const { connect } = require('../database');

// Mock the authMiddleware to always pass
jest.mock('../authMiddleware', () => (req, res, next) => next());

// Mock the database connection and methods
jest.mock('../database', () => {
  const updateOne = jest.fn();
  const findOne = jest.fn();
  const insertOne = jest.fn();
  const deleteOne = jest.fn();
  
  return {
    connect: () => ({
      collection: () => ({
        updateOne,
        findOne,
        insertOne,
        deleteOne,
      }),
    }),
    updateOne,
    findOne,
    insertOne,
    deleteOne,
  };
});

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
    connect().collection().findOne.mockResolvedValue({ recentEssay: mockEssayData });

    const response = await request(app)
      .get('/api/getRecentEssay')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockEssayData);
    expect(connect().collection().findOne).toHaveBeenCalled();
  });

  test('/clearSelections clears essay data', async () => {
    connect().collection().updateOne.mockResolvedValue({ result: { nModified: 1 } });

    const response = await request(app)
      .post('/api/clearSelections')
      .set('Authorization', 'Bearer test-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain('cleared');
    expect(connect().collection().updateOne).toHaveBeenCalled();
  });
});

module.exports = { app };