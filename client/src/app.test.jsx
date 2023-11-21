//This is just an example of how I will have to run tests
//For every component, I would create one of these component.test.jsx files

import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders Vite + React header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Vite \+ React/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders images', () => {
    render(<App />);
    const viteLogo = screen.getByAltText('Vite logo');
    const reactLogo = screen.getByAltText('React logo');
    expect(viteLogo).toBeInTheDocument();
    expect(reactLogo).toBeInTheDocument();
  });

  test('initial count is 0', () => {
    render(<App />);
    const countElement = screen.getByText(/count is 0/i);
    expect(countElement).toBeInTheDocument();
  });

  test('increments count on button click', () => {
    render(<App />);
    const buttonElement = screen.getByText(/count is/i);
    fireEvent.click(buttonElement);
    const countElement = screen.getByText(/count is 1/i);
    expect(countElement).toBeInTheDocument();
  });

  test('contains link to Vite and React documentation', () => {
    render(<App />);
    const viteLink = screen.getByRole('link', { name: /Vite logo/i });
    const reactLink = screen.getByRole('link', { name: /React logo/i });
    expect(viteLink).toHaveAttribute('href', 'https://vitejs.dev');
    expect(reactLink).toHaveAttribute('href', 'https://react.dev');
  });

  test('renders edit instructions', () => {
    render(<App />);
    const editInstructions = screen.getByText(/Edit src\/App\.jsx and save to test HMR/i);
    expect(editInstructions).toBeInTheDocument();
  });
});
