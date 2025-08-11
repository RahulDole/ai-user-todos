import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';

// Mock the global fetch function
globalThis.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders login form', () => {
    render(<Login />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('displays validation errors for empty fields', () => {
    render(<Login />);
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if validation errors are displayed
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
  
  test('validates email format requirements', () => {
    render(<Login />);
    
    // Enter an email without @ symbol
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalidemail.com' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    
    // Enter an email without domain
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    
    // Enter an email without TLD
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@domain' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });
  
  test('shows success message on valid submission and stores token', async () => {
    // Mock successful fetch response with token
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Login successful', token: 'test-auth-token' })
    });
    
    render(<Login />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if success message is displayed
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      expect(screen.getByText(/welcome back, valid.user@example.com/i)).toBeInTheDocument();
    });
    
    // Verify that fetch was called with the correct arguments
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://identity-service-365603594789.europe-west1.run.app/api/v1/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'valid.user@example.com',
          password: 'Password123'
        })
      }
    );
    
    // Verify that the token was stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'test-auth-token');
  });
  
  test('shows error message on server error', async () => {
    // Mock server error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' })
    });
    
    render(<Login />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    // Verify that the token was not stored in localStorage
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  
  test('shows error message on network failure', async () => {
    // Mock network failure
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    render(<Login />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
    
    // Verify that the token was not stored in localStorage
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});