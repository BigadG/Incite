import { render, screen } from '@testing-library/react';
import ResultTextArea from '../ResultTextArea';

describe('ResultTextArea Component', () => {
  test('displays loading text when loading', () => {
    const loadingText = 'Loading...';
    render(<ResultTextArea isLoading={true} loadingText={loadingText} result="" />);

    const textareaElement = screen.getByPlaceholderText(loadingText);
    expect(textareaElement).toHaveValue(loadingText);
    expect(textareaElement).toHaveAttribute('readOnly');
  });

  test('displays result when not loading', () => {
    const resultText = 'This is the result';
    render(<ResultTextArea isLoading={false} loadingText='' result={resultText} />);

    const textareaElement = screen.getByPlaceholderText('Result');
    expect(textareaElement).toHaveValue(resultText);
    expect(textareaElement).toHaveAttribute('readOnly');
  });

  test('is readOnly', () => {
    render(<ResultTextArea isLoading={false} loadingText='' result="Result" />);

    const textareaElement = screen.getByPlaceholderText('Result');
    expect(textareaElement).toHaveAttribute('readOnly');
  });
});
