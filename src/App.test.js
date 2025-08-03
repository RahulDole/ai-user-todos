import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the react-router-dom components to avoid errors in tests
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  Link: ({ children }) => <a>{children}</a>
}));

test('renders To Do List brand in navbar', () => {
  render(<App />);
  // Use a more specific query to target just the navbar brand
  const brandElement = screen.getByText(/to do list/i, { selector: 'a' });
  expect(brandElement).toBeInTheDocument();
});
