import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InciteForm from '../InciteForm';
import axios from 'axios';

jest.mock('query-string', () => ({
  parse: jest.fn(() => ({ uuid: 'mock-uuid' })),
  stringify: jest.fn(),
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
  }, 10000); // Increase timeout if necessary

  test('submits form and generates essay', async () => {
    axios.post.mockResolvedValueOnce({ status: 200, data: { essay: 'Generated Essay' } });

    render(<InciteForm />);

    const thesisInput = screen.getByLabelText(/Essay Premise:/i);
    const bodyPremisesInput = screen.getAllByLabelText(/Body Premises:/i)[0]; // If there are multiple inputs, get the first
    const submitButton = screen.getByRole('button', { name: /Sum It!/i });

    await userEvent.type(thesisInput, 'This is a test thesis');
    await userEvent.type(bodyPremisesInput, 'This is a test premise');
    userEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/generateEssayWithSelections',
        expect.any(Object),
        expect.any(Object)
      );
      expect(screen.getByText('Generated Essay')).toBeInTheDocument();
    }, 10000); // Increase timeout if necessary
  });
});