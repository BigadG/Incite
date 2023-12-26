import React from 'react';
import { render, screen } from '@testing-library/react';
import MainPage from '../components/MainPage';

describe('MainPage', () => {
  test('renders MainPage component', () => {
    render(<MainPage />);
    expect(screen.getByText('Welcome to the New Page')).toBeInTheDocument();
  });
});
