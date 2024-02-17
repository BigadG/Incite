import { render } from '@testing-library/react';
import axios from 'axios';
import InciteForm from '../InciteForm';

// Mock the axios and query-string modules
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

    render(<InciteForm />);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/selections'), expect.anything());
  });
});
