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

        await waitFor(() => {
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(1, 0, 'author', 'J');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(2, 0, 'author', 'Ja');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(3, 0, 'author', 'Jan');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(4, 0, 'author', 'Jane');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(5, 0, 'author', 'Jane ');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(6, 0, 'author', 'Jane D');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(7, 0, 'author', 'Jane Do');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(8, 0, 'author', 'Jane Doe');
            expect(mockOnCitationChange).toHaveBeenNthCalledWith(9, 0, 'publicationDate', '2021-01-01');
        });
    });

    test('submits when all inputs are valid and sends data to the server', async () => {
        axios.post.mockResolvedValue({ status: 200 });

        const authorInput = screen.getByPlaceholderText("Author's name");
        const publicationDateInput = screen.getByLabelText("Publication Date:");
        const submitButton = screen.getByRole('button', { name: /submit citations/i });

        await userEvent.type(authorInput, 'Jane Doe');
        await userEvent.type(publicationDateInput, '2021-01-01');
        userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled();
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:3001/api/updateSelections',
                {
                    updatedSelections: expect.arrayContaining([
                        expect.objectContaining({ author: 'Jane Doe', publicationDate: '2021-01-01' })
                    ]),
                    uuid: expect.any(String),
                },
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: expect.stringContaining('Bearer')
                    })
                })
            );
        });
    });
});


