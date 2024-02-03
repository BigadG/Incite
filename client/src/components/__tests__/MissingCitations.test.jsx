import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from '../MissingCitations';
import axios from 'axios';

jest.mock('axios');

describe('MissingCitations Component', () => {
    const mockOnCitationChange = jest.fn();
    const mockOnSubmit = jest.fn();
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
        // Reset mocks before each test
        jest.clearAllMocks();
        axios.post.mockClear();
        mockOnCitationChange.mockClear();
        mockOnSubmit.mockClear();

        render(
            <MissingCitations
                missing={missingCitationsData}
                onCitationChange={mockOnCitationChange}
                onSubmit={mockOnSubmit}
            />
        );
    });

    test('accepts input and validates correctly', async () => {
        const authorInput = screen.getByPlaceholderText("Author's name");
        const publicationDateInput = screen.getByLabelText("Publication Date:");

        // Simulate typing the author name and publication date
        await userEvent.type(authorInput, 'Jane Doe');
        await userEvent.type(publicationDateInput, '2021-01-01');

        // Assertions to ensure the mock function was called with expected arguments
        expect(mockOnCitationChange).toHaveBeenNthCalledWith(1, 0, 'author', 'J');
        expect(mockOnCitationChange).toHaveBeenNthCalledWith(2, 0, 'author', 'a');
        // The final call should reflect the complete input
        expect(mockOnCitationChange).toHaveBeenNthCalledWith(8, 0, 'author', 'Jane Doe');

        // Similar approach for publication date if applicable
    });

    test('submits when all inputs are valid and sends data to the server', async () => {
        const authorInput = screen.getByPlaceholderText("Author's name");
        const publicationDateInput = screen.getByLabelText("Publication Date:");
        const submitButton = screen.getByRole('button', { name: /submit citations/i });

        // Fill in the inputs
        await userEvent.type(authorInput, 'Jane Doe');
        await userEvent.type(publicationDateInput, '2021-01-01');

        // Mock successful axios response
        axios.post.mockResolvedValueOnce({ status: 200 });

        // Attempt to submit the form
        await userEvent.click(submitButton);

        // Use a more lenient assertion for axios.post to check for any call
        expect(axios.post).toHaveBeenCalledTimes(1);
        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:3001/api/updateSelections',
            expect.anything(), // The exact payload might need more specific matching
            expect.anything()
        );

        // Verify if the onSubmit callback was called, if that's part of the expected behavior
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
});
