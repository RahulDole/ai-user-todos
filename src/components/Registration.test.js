import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Registration from './Registration';

// Mock the global fetch function
global.fetch = jest.fn();

describe('Registration Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    render(<Registration />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });
  
  test('displays validation errors for empty fields', () => {
    render(<Registration />);
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation errors are displayed
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
  
  test('validates email format requirements', () => {
    render(<Registration />);
    
    // Enter an email without @ symbol
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalidemail.com' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    
    // Enter an email without domain
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    
    // Enter an email without TLD
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@domain' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });
  
  test('validates password requirements', () => {
    render(<Registration />);
    
    // Enter a short password
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    
    // Enter a password without uppercase
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
    
    // Enter a password without lowercase
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'PASSWORD123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument();
    
    // Enter a password without numbers
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'PasswordTest' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
  });
  
  test('shows success message on valid submission', async () => {
    // Mock successful fetch response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'User registered successfully' })
    });
    
    render(<Registration />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'ValidPass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if success message is displayed
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
      expect(screen.getByText(/thank you for registering with valid.user@example.com/i)).toBeInTheDocument();
    });
    
    // Verify that fetch was called with the correct arguments
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://identity-service-365603594789.europe-west1.run.app/api/v1/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'valid.user@example.com',
          password: 'ValidPass123'
        })
      }
    );
  });
  
  test('shows error message on server error', async () => {
    // Mock server error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid username or password' })
    });
    
    render(<Registration />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'ValidPass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });
  
  test('shows error message on network failure', async () => {
    // Mock network failure
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    render(<Registration />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'ValidPass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});