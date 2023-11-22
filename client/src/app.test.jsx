import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Vite + React')).toBeInTheDocument();
  });

  test('renders increment button', () => {
    render(<App />);
    const buttonElement = screen.getByText(/count is/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders links to Vite and React', () => {
    render(<App />);
    const viteLink = screen.getByRole('link', { name: /Vite logo/i });
    const reactLink = screen.getByRole('link', { name: /React logo/i });
    expect(viteLink).toBeInTheDocument();
    expect(reactLink).toBeInTheDocument();
  });
});