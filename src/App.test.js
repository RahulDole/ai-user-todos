import { render, screen } from '@testing-library/react';
import App from './App';

test('renders user registration app heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/user registration app/i);
  expect(headingElement).toBeInTheDocument();
});
