import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from '../MissingCitations';
import axios from 'axios';
import '@testing-library/jest-dom';

jest.mock('axios');

describe('MissingCitations Component', () => {
    const mockOnCitationChange = jest.fn();
    const mockOnSubmit = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        render(
            <MissingCitations
                missing={[{
                    title: "Sample Article",
                    url: "http://example.com",
                    missingFields: { author: true, publicationDate: true },
                }]}
                onCitationChange={mockOnCitationChange}
                onSubmit={mockOnSubmit}
            />
        );
    });

    test('accepts input and validates correctly', async () => {
        const authorInput = screen.getByPlaceholderText("Author's name");
        await userEvent.type(authorInput, 'Jane Doe');

        // Adjusted for a realistic expectation considering userEvent.type's behavior
        await waitFor(() => {
            expect(mockOnCitationChange).toHaveBeenCalledTimes(8);
        });
        expect(mockOnCitationChange).toHaveBeenCalledWith(0, 'author', 'Jane Doe');

        const publicationDateInput = screen.getByLabelText("Publication Date:");
        await userEvent.type(publicationDateInput, '2021-01-01');

        // Ensuring publication date change is captured after async user events
        await waitFor(() => {
            expect(mockOnCitationChange).toHaveBeenCalledWith(0, 'publicationDate', '2021-01-01');
        });
    });

    test('submits when all inputs are valid and sends data to the server', async () => {
        axios.post.mockResolvedValueOnce({ status: 200 });

        const authorInput = screen.getByPlaceholderText("Author's name");
        await userEvent.type(authorInput, 'Jane Doe');
        const publicationDateInput = screen.getByLabelText("Publication Date:");
        await userEvent.type(publicationDateInput, '2021-01-01');

        const submitButton = screen.getByRole('button', { name: /submit citations/i });
        await userEvent.click(submitButton);

        // Correctly waiting for axios.post to be called after async actions
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3001/api/updateSelections',
                expect.anything(),
                expect.anything()
            );
        });
    });
});
