// InciteForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InciteForm from '../InciteForm';
import axios from 'axios';

jest.mock('axios');

describe('InciteForm Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('fetches selections and renders URLs on mount', async () => {
    const mockSelections = [
      { url: 'http://example.com/1', title: 'Example 1' },
      { url: 'http://example.com/2', title: 'Example 2' }
    ];

    axios.get.mockResolvedValue({ status: 200, data: mockSelections });

    render(<InciteForm />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('selections'), expect.any(Object));
      mockSelections.forEach(selection => {
        expect(screen.getByText(selection.url)).toBeInTheDocument();
      });
    });
  });

  test('submits form and generates essay', async () => {
    const thesisInput = screen.getByLabelText('Thesis:');
    const bodyPremisesInput = screen.getByLabelText('Body Premises:');
    const submitButton = screen.getByText('Sum It!');

    // Mock the axios post request for essay generation
    axios.post.mockResolvedValueOnce({ status: 200, data: { essay: 'Generated Essay' } });

    // Simulate user input
    userEvent.type(thesisInput, 'This is a test thesis');
    userEvent.type(bodyPremisesInput, 'This is a test premise');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/generateEssayWithSelections', expect.any(Object), expect.any(Object));
      expect(screen.getByText('Generated Essay')).toBeInTheDocument();
    });
  });
});
