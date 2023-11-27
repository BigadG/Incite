import { render, screen } from '@testing-library/react';
import SampleComponent from '../components/SampleComponent';

test('renders SampleComponent', () => {
  render(<SampleComponent />);
  expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});
