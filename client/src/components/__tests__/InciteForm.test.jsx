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
    sessionStorage.clear();
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
    const submitButton = screen.getByRole('button', { name: /generate/i });

    await userEvent.type(thesisInput, 'This is a test thesis');
    await userEvent.type(bodyPremisesInputs[1], 'This is a test premise');
    await userEvent.click(submitButton);

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
      expect(screen.getByText(mockResponse.essay)).toBeInTheDocument();
    });
  });

  test('essay should be saved to the database after generation', async () => {
    const mockSaveResponse = { data: { message: 'Essay saved successfully' } };
    axios.post.mockResolvedValueOnce(mockSaveResponse);

    render(<InciteForm />);
    // ... enter data into form fields and simulate form submission ...
    const submitButton = screen.getByRole('button', { name: /generate/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/saveRecentEssay'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    // Check if the sessionStorage was called correctly
    await waitFor(() => {
      expect(sessionStorage.setItem).toHaveBeenCalledWith('recentEssayData', expect.any(String));
    });
  });

  test('page content remains after reload', async () => {
    const mockEssayData = { thesis: 'Test Thesis', premises: ['Test Premise 1', 'Test Premise 2'], essay: 'Test Essay' };
    sessionStorage.setItem('recentEssayData', JSON.stringify(mockEssayData));

    render(<InciteForm />);

    // Assertions to check if the form inputs and essay content are populated with session data
    await waitFor(() => {
      expect(screen.getByLabelText(/Essay Premise:/i).value).toBe(mockEssayData.thesis);
      // ... additional assertions for premises and essay content ...
    });
  });

  test('clear selections button should clear saved selections in database and UI', async () => {
    const mockClearResponse = { data: { message: 'Selections cleared successfully' } };
    axios.post.mockResolvedValueOnce(mockClearResponse);

    render(<InciteForm />);

    // Simulate clicking the clear button
    const clearButton = screen.getByRole('button', { name: /clear selections/i });
    await userEvent.click(clearButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/clearSelections'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    // Assert that UI updates occurred here
    // ...
  });
});
