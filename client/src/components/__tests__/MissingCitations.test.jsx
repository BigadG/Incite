import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MissingCitations from '../MissingCitations';
import axios from 'axios';

jest.mock('axios');

describe('MissingCitations Component', () => {
  let onCitationChangeMock;
  let onSubmitMock;

  beforeEach(() => {
    onCitationChangeMock = jest.fn();
    onSubmitMock = jest.fn();
    axios.post.mockClear();
    render(
      <MissingCitations
        missing={[{
          title: "Sample Article",
          url: "http://example.com",
          missingFields: { author: true, publicationDate: true },
          author: '',
          publicationDate: '',
        }]}
        onCitationChange={onCitationChangeMock}
        onSubmit={onSubmitMock}
      />
    );
  });

  test('accepts input and validates correctly', async () => {
    const authorInput = screen.getByPlaceholderText("Author's name");
    const publicationDateInput = screen.getByLabelText("Publication Date:");

    await userEvent.type(authorInput, 'Jane Doe');
    await userEvent.type(publicationDateInput, '2021-01-01');

    // Verify if onCitationChangeMock was called with expected values
    await waitFor(() => {
      expect(onCitationChangeMock).toHaveBeenCalledWith(0, 'author', 'Jane Doe');
      expect(onCitationChangeMock).toHaveBeenCalledWith(0, 'publicationDate', '2021-01-01');
    });
  });

  test('submits when all inputs are valid and sends data to the server', async () => {
    axios.post.mockResolvedValue({ status: 200 });

    await userEvent.type(screen.getByPlaceholderText("Author's name"), 'Jane Doe');
    await userEvent.type(screen.getByLabelText("Publication Date:"), '2021-01-01');
    userEvent.click(screen.getByRole('button', { name: /submit citations/i }));

    // Wait for the form submission to trigger axios post
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/updateSelections',
        expect.anything(),  // Adjust as necessary to match expected request body
        expect.anything()  // Adjust as necessary for headers or other args
      );
    });
  });
});

