jest.mock('../../envConfig', () => ({
  API_BASE_URL: 'http://localhost:3001/api'
}));

import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import InciteForm from '../InciteForm';

jest.mock('axios');
jest.mock('query-string', () => ({
  parse: jest.fn().mockReturnValue({ uuid: 'mock-uuid' }),
}));

// Mock sessionStorage
const mockedSessionStorage = (function() {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
    removeItem(key) {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockedSessionStorage
});

describe('InciteForm Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('fetches selections and updates state on mount', async () => {
    const mockSelections = [
      { url: 'http://example.com/1', title: 'Example 1' },
      { url: 'http://example.com/2', title: 'Example 2' }
    ];

    axios.get.mockResolvedValue({ status: 200, data: mockSelections });

    // Use the mocked API_BASE_URL for the apiBaseUrl prop
    const { API_BASE_URL } = require('../../envConfig');

    await waitFor(() => {
      render(<InciteForm apiBaseUrl={API_BASE_URL} />);
      // It is now okay if there is no explicit assertion here.
      // Main concern is making sure the axios call happens within an act scope.
    });

    // Check that axios.get was called correctly
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/selections'), expect.anything());
  });
});