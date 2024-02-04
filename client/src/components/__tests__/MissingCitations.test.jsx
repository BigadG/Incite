import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from '../MissingCitations';
import axios from 'axios';

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
        const publicationDateInput = screen.getByLabelText("Publication Date:");

        await userEvent.type(authorInput, 'Jane Doe');
        await userEvent.type(publicationDateInput, '2021-01-01');

        await waitFor(() => {
            expect(mockOnCitationChange).toHaveBeenCalledWith(expect.any(Number), 'author', 'Jane Doe');
            expect(mockOnCitationChange).toHaveBeenCalledWith(expect.any(Number), 'publicationDate', '2021-01-01');
        });
    });

    test('submits when all inputs are valid and sends data to the server', async () => {
        axios.post.mockResolvedValueOnce({ status: 200 });

        // Trigger form submission
        userEvent.click(screen.getByRole('button', { name: /submit citations/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3001/api/updateSelections',
                expect.any(Object),
                expect.any(Object)
            );
        });
    });
});

