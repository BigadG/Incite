// MissingCitations.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from './MissingCitations';
import axios from 'axios';

// Mock axios module for all tests in this file
jest.mock('axios');

describe('MissingCitations Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCitationChange = jest.fn();
  const missingCitationsData = [
    {
      title: "Sample Article",
      url: "http://example.com",
      missingFields: {
        author: true,
        publicationDate: true,
      },
    },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    render(<MissingCitations missing={missingCitationsData} onCitationChange={mockOnCitationChange} onSubmit={mockOnSubmit} />);
  });

  test('renders with initial state', () => {
    expect(screen.getByText("Missing Citation Information")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Author's name")).toBeInTheDocument();
    expect(screen.getByLabelText("Publication Date:")).toBeInTheDocument();
  });

  test('validates input fields and does not submit with empty fields', async () => {
    const submitButton = screen.getByText('Submit Citations');
    userEvent.click(submitButton);

    // Should not call onSubmit when inputs are invalid
    expect(mockOnSubmit).not.toHaveBeenCalled();

    await waitFor(() => {
      const invalidInputs = screen.getAllByRole('textbox').filter(input => input.className.includes('invalid-input'));
      expect(invalidInputs.length).toBeGreaterThan(0);
    });
  });

  test('accepts input and validates correctly', () => {
    const authorInput = screen.getByPlaceholderText("Author's name");
    const publicationDateInput = screen.getByLabelText("Publication Date:");

    // Simulate user typing an author name
    userEvent.type(authorInput, 'Jane Doe');
    expect(mockOnCitationChange).toHaveBeenCalledWith(0, 'author', 'Jane Doe');

    // Simulate user adding a publication date
    fireEvent.change(publicationDateInput, { target: { value: '2021-01-01' } });
    expect(mockOnCitationChange).toHaveBeenCalledWith(0, 'publicationDate', '2021-01-01');
  });

  test('submits when all inputs are valid and sends data to the server', async () => {
    const authorInput = screen.getByPlaceholderText("Author's name");
    const publicationDateInput = screen.getByLabelText("Publication Date:");
    const submitButton = screen.getByText('Submit Citations');

    // Mock the axios post request
    axios.post.mockResolvedValue({ status: 200 });

    // Simulate user input
    userEvent.type(authorInput, 'Jane Doe');
    fireEvent.change(publicationDateInput, { target: { value: '2021-01-01' } });
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/updateSelections', expect.any(Object), expect.any(Object));
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
