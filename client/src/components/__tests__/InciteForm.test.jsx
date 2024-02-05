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
      { url: 'http://example.com/2', title: 'Example 2' }
    ];

    axios.get.mockResolvedValue({ status: 200, data: mockSelections });

    render(<InciteForm />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('selections'), expect.any(Object));
      mockSelections.forEach(async (selection) => {
        expect(await screen.findByText(selection.url)).toBeInTheDocument();
      });
    });
  });

  test('submits form and generates essay', async () => {
    axios.post.mockResolvedValueOnce({ status: 200, data: { essay: 'Generated Essay' } });

    render(<InciteForm />);

    const thesisInput = screen.getByLabelText(/Essay Premise:/i);
    const bodyPremisesInput = screen.getAllByRole('textbox')[1]; // Assuming the second textbox is for body premises
    const submitButton = screen.getByRole('button', { name: /sum it!/i });

    await userEvent.type(thesisInput, 'This is a test thesis');
    await userEvent.type(bodyPremisesInput, 'This is a test premise');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/generateEssayWithSelections'),
        expect.objectContaining({
          thesis: 'This is a test thesis',
          bodyPremises: expect.arrayContaining(['This is a test premise']),
        }),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Generated Essay')).toBeInTheDocument();
    });
  });
});