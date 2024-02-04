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
            author: '',
            publicationDate: '',
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

    test('accepts input and validates correctly', async () => {
        const authorInput = screen.getByPlaceholderText("Author's name");
        await userEvent.type(authorInput, 'Jane Doe');

        // Expectation for mockOnCitationChange after user event
        expect(mockOnCitationChange).toHaveBeenLastCalledWith(0, 'author', 'Jane Doe');

        const publicationDateInput = screen.getByLabelText("Publication Date:");
        await userEvent.type(publicationDateInput, '2021-01-01');

        // Expectation for mockOnCitationChange for publication date
        expect(mockOnCitationChange).toHaveBeenLastCalledWith(0, 'publicationDate', '2021-01-01');
    });

    test('submits when all inputs are valid and sends data to the server', async () => {
        axios.post.mockResolvedValueOnce({ status: 200 });

        const authorInput = screen.getByPlaceholderText("Author's name");
        const publicationDateInput = screen.getByLabelText("Publication Date:");

        // Simulate filling out the form
        await userEvent.type(authorInput, 'Jane Doe');
        await userEvent.type(publicationDateInput, '2021-01-01');

        const submitButton = screen.getByRole('button', { name: /submit citations/i });
        userEvent.click(submitButton);

        // Assertion to ensure axios.post was called correctly
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3001/api/updateSelections',
                expect.anything(),
                expect.anything()
            );
        });

        // Optionally verify if the mockOnSubmit function was called, if it's part of the form's submit handler
        expect(mockOnSubmit).toHaveBeenCalled();
    });
});

