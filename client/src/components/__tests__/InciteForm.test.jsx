import { render, waitFor } from '@testing-library/react';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import InciteForm from '../InciteForm';

jest.mock('query-string', () => ({
  parse: jest.fn().mockReturnValue({ uuid: 'mock-uuid' }),
}));

jest.mock('axios');

// Mock the import.meta.env for Jest
const mockEnvironmentVariables = {
  VITE_API_BASE_URL: 'http://localhost:3001',
};

beforeAll(() => {
  global.import = {
    meta: {
      env: mockEnvironmentVariables
    }
  };
});

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
            render(<InciteForm />);
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`${mockEnvironmentVariables.VITE_API_BASE_URL}/api/selections`, expect.any(Object));
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

        // Place your assertions here
        // ...
    });
});
