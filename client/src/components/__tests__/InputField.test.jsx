import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from '../InputField';

describe('InputField Component', () => {
  // This mock function simulates the curried function's behavior.
  const mockHandleChange = jest.fn();
  
  it('renders an input field and responds to changes', async () => {
    const curriedHandleChangeMock = jest.fn().mockImplementation(() => mockHandleChange);

    render(<InputField index={1} value="" handleChange={curriedHandleChangeMock} />);
    const input = screen.getByPlaceholderText('Body 1');

    // Simulate typing "Test input" into the input field.
    await userEvent.type(input, 'Test input');

    // The curried function is initialized once for each character typed.
    await waitFor(() => {
      // Expect the curried function to be called with the index for each character.
      expect(curriedHandleChangeMock).toHaveBeenCalledTimes('Test input'.length);
    });

    // The mockHandleChange function, returned from the curried function, is called per character.
    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledTimes('Test input'.length);
    });
  });

  it('renders a label for the first input field', () => {
    render(<InputField index={0} value="" handleChange={mockHandleChange} />);
    expect(screen.getByLabelText('Essay Premise:')).toBeInTheDocument();
  });
});
