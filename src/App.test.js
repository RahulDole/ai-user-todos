import { render, screen } from '@testing-library/react';
import App from './App';

// Import the mock directly instead of using jest.mock
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// The mock implementation is in src/__mocks__/react-router-dom.js

test('renders To Do List brand in navbar', () => {
  render(<App />);
  // Use a more specific query to target just the navbar brand
  const brandElement = screen.getByText(/to do list/i, { selector: 'a' });
  expect(brandElement).toBeInTheDocument();
});
