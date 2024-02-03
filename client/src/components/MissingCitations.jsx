import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from '../MissingCitations';
import axios from 'axios';
import { act } from 'react-dom/test-utils';

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
    const submitButton = screen.getByRole('button', { name: /submit citations/i });
    await userEvent.click(submitButton);

    // Should not call onSubmit when inputs are invalid
    expect(mockOnSubmit).not.toHaveBeenCalled();

    await waitFor(() => {
      const invalidInputs = screen.getAllByRole('textbox').filter(input => input.className.includes('invalid-input'));
      expect(invalidInputs.length).toBeGreaterThan(0);
    });
  });

  test('accepts input and validates correctly', async () => {
    const authorInput = screen.getByPlaceholderText("Author's name");
    const publicationDateInput = screen.getByLabelText("Publication Date:");

    // Simulate user typing an author name
    await userEvent.type(authorInput, 'Jane Doe');
    // Wait for all typing events to be processed
    await waitFor(() => {
      expect(mockOnCitationChange).toHaveBeenLastCalledWith(0, 'author', 'Jane Doe');
    });

    // Simulate user adding a publication date
    await userEvent.type(publicationDateInput, '2021-01-01');
    // Ensure the publication date change is processed
    await waitFor(() => {
      expect(mockOnCitationChange).toHaveBeenLastCalledWith(0, 'publicationDate', '2021-01-01');
    });
  });

  test('submits when all inputs are valid and sends data to the server', async () => {
    const authorInput = screen.getByPlaceholderText("Author's name");
    const publicationDateInput = screen.getByLabelText("Publication Date:");
    const submitButton = screen.getByRole('button', { name: /submit citations/i });

    axios.post.mockResolvedValue({ status: 200 });

    // Simulate user input
    await userEvent.type(authorInput, 'Jane Doe');
    await userEvent.type(publicationDateInput, '2021-01-01');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3001/api/updateSelections', expect.any(Object), expect.any(Object));
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});




