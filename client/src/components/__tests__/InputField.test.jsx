import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from '../InputField';

describe('InputField Component', () => {
  const mockHandleChange = jest.fn();

  it('renders correctly and responds to user input', () => {
    const fieldIndex = 1;
    const fieldValue = 'Initial value';

    render(<InputField index={fieldIndex} value={fieldValue} handleChange={mockHandleChange} />);

    // Check if the input field is rendered with the correct value
    const inputElement = screen.getByPlaceholderText(`Body ${fieldIndex}`);
    expect(inputElement).toHaveValue(fieldValue);

    // Simulate user typing
    userEvent.type(inputElement, 'New text');
    
    // Check if the handleChange function is called with the correct parameters
    expect(mockHandleChange).toHaveBeenCalledWith(fieldIndex);
    // Since each key press is a separate event, we multiply the number of characters by the number of events per character
    expect(mockHandleChange).toHaveBeenCalledTimes('New text'.length);
  });

  it('renders a label for the premise when index is 0', () => {
    render(<InputField index={0} value="" handleChange={mockHandleChange} />);
    expect(screen.getByLabelText("Essay Premise:")).toBeInTheDocument();
  });
});
