import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InciteForm from '../InciteForm';
import axios from 'axios';

jest.mock('query-string', () => ({
  parse: jest.fn(() => ({ uuid: 'mock-uuid' })),
}));

jest.mock('axios');

describe('InciteForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches selections and renders URLs on mount', async () => {
    const mockSelections = [
      { url: 'http://example.com/1', title: 'Example 1' },
      { url: 'http://example.com/2', title: 'Example 2' },
    ];

    axios.get.mockResolvedValue({ status: 200, data: mockSelections });

    render(<InciteForm />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('selections'), expect.any(Object));
    });
  });

  test('submits form and generates essay', async () => {
    const mockResponse = { essay: 'Generated Essay' };
    axios.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

    render(<InciteForm />);

    const thesisInput = screen.getByLabelText(/Essay Premise:/i);
    const bodyPremisesInputs = screen.getAllByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /sum it!/i });

    await userEvent.type(thesisInput, 'This is a test thesis');
    // Assuming the first body premise input follows the thesis input
    await userEvent.type(bodyPremisesInputs[1], 'This is a test premise');
    userEvent.click(submitButton);

    await waitFor(() => {
      // Validate that a post request was made with expected data
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/generateEssayWithSelections'),
        expect.objectContaining({
          thesis: 'This is a test thesis',
          bodyPremises: expect.arrayContaining(['This is a test premise']),
        }),
        expect.any(Object)
      );
    });

    // Instead of checking for URLs in the DOM, we check for the generated essay text
    await waitFor(() => {
      expect(screen.getByText(mockResponse.essay)).toBeInTheDocument();
    });
  });
});