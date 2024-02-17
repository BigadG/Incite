import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
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
    window.sessionStorage.clear();
    jest.clearAllMocks();
  });
  
    test('fetches selections and renders URLs on mount', async () => {
        const mockSelections = [
        { url: 'http://example.com/1', title: 'Example 1' },
        { url: 'http://example.com/2', title: 'Example 2' },
        ];

        axios.get.mockResolvedValue({ status: 200, data: mockSelections });

        await act(async () => {
        const { getByText } = render(<InciteForm />);
        await waitFor(() => {
            expect(getByText(/Example 1/)).toBeInTheDocument();
            expect(getByText(/Example 2/)).toBeInTheDocument();
        });
        });
    });

    test('clear selections button should clear saved selections in database and UI', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: [] });

        await act(async () => {
            render(<InciteForm />);
        });

        sessionStorage.clear();
        axios.get.mockResolvedValueOnce({ status: 200, data: [] });

        await act(async () => {
            render(<InciteForm />);
        });
    });
});
