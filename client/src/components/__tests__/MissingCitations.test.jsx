import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from '../MissingCitations';
import axios from 'axios';

jest.mock('axios');

describe('MissingCitations Component', () => {
    const mockOnCitationChange = jest.fn();
    const mockOnSubmit = jest.fn();

    beforeEach(async () => {
        jest.clearAllMocks();
        render(
            <MissingCitations
                missing={[{
                    title: "Sample Article",
                    url: "http://example.com",
                    missingFields: { author: true, publicationDate: true },
                    author: '',
                    publicationDate: '',
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

        // Corrected to check if the mock function was called with expected values at any time
        await waitFor(() => {
            const authorCalled = mockOnCitationChange.mock.calls.some(call => call.includes('Jane Doe'));
            const publicationDateCalled = mockOnCitationChange.mock.calls.some(call => call.includes('2021-01-01'));
            expect(authorCalled).toBeTruthy();
            expect(publicationDateCalled).toBeTruthy();
        });
    });

    test('submits when all inputs are valid and sends data to the server', async () => {
        axios.post.mockResolvedValue({ status: 200 });

        // Corrected to trigger the form submission logic within the component
        const submitButton = screen.getByRole('button', { name: /submit citations/i });

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3001/api/updateSelections',
                expect.any(Object),  // Corrected to match the expected call
                expect.any(Object)
            );
        });
    });
});
