import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from '../MissingCitations';
import axios from 'axios';

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
        jest.clearAllMocks();
        render(
            <MissingCitations
                missing={missingCitationsData}
                onCitationChange={mockOnCitationChange}
                onSubmit={mockOnSubmit}
            />
        );
    });

    test('renders with initial state', () => {
        expect(screen.getByText("Missing Citation Information")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Author's name")).toBeInTheDocument();
        expect(screen.getByLabelText("Publication Date:")).toBeInTheDocument();
    });

    test('accepts input and validates correctly', async () => {
        const authorInput = screen.getByPlaceholderText("Author's name");
        const publicationDateInput = screen.getByLabelText("Publication Date:");

        await userEvent.type(authorInput, 'Jane Doe');
        await userEvent.type(publicationDateInput, '2021-01-01');

        await waitFor(() => {
            // Check that mock function was called with the final values at any point
            expect(mockOnCitationChange.mock.calls.some(call => call.includes('Jane Doe'))).toBe(true);
            expect(mockOnCitationChange.mock.calls.some(call => call.includes('2021-01-01'))).toBe(true);
        });
    });

    test('submits when all inputs are valid and sends data to the server', async () => {
        const authorInput = screen.getByPlaceholderText("Author's name");
        const publicationDateInput = screen.getByLabelText("Publication Date:");
        const submitButton = screen.getByRole('button', { name: /submit citations/i });

        axios.post.mockResolvedValue({ status: 200 });

        await userEvent.type(authorInput, 'Jane Doe');
        await userEvent.type(publicationDateInput, '2021-01-01');

        userEvent.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3001/api/updateSelections',
                expect.anything(), // Use expect.anything() if the exact object structure is not crucial
                expect.anything()
            );
            expect(mockOnSubmit).toHaveBeenCalled();
        });
    });
});
