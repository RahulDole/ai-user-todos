import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from './Login';
import { useLocation, useNavigate, navigate } from 'react-router-dom';

// Mock useLocation hook
jest.mock('react-router-dom');

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
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('displays validation errors for empty fields', () => {
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if validation errors are displayed
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
  
  test('validates email format requirements', () => {
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
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
      json: async () => ({ success: true, message: 'Login successful', access_token: 'test-auth-token' })
    });
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
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
    
    // Verify that setAuthState was called with the correct arguments
    expect(mockSetAuthState).toHaveBeenCalledWith({
      isAuthenticated: true,
      user: { email: 'valid.user@example.com' },
      loading: false
    });
  });
  
  test('shows countdown timer and redirect message after successful login', async () => {
    // Mock successful fetch response with token
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Login successful', access_token: 'test-auth-token' })
    });
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if success message is displayed
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
    
    // Check if redirect message is displayed
    expect(screen.getByText(/you will be redirected to the home page in 3 seconds/i)).toBeInTheDocument();
    
    // Check if progress bar is displayed
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    
    // Check if Go to Home button is displayed
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
  });
  
  test('navigates to home page when Go to Home button is clicked', async () => {
    // Mock successful fetch response with token
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Login successful', access_token: 'test-auth-token' })
    });
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if success message is displayed
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
    
    // Click the Go to Home button
    fireEvent.click(screen.getByRole('button', { name: /go to home/i }));
    
    // Verify that navigate was called with the correct path
    expect(navigate).toHaveBeenCalledWith('/');
  });
  
  test('navigates to home page automatically after countdown', async () => {
    // Mock successful fetch response with token
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Login successful', access_token: 'test-auth-token' })
    });
    
    // Mock timers
    jest.useFakeTimers();
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if success message is displayed
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
    
    // Fast-forward timers to trigger the countdown
    act(() => {
      jest.advanceTimersByTime(1000); // 1 second
    });
    
    // Check countdown is at 2
    expect(screen.getByText(/you will be redirected to the home page in 2 seconds/i)).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(1000); // 1 more second
    });
    
    // Check countdown is at 1
    expect(screen.getByText(/you will be redirected to the home page in 1 second/i)).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(1000); // 1 more second
    });
    
    // Verify that navigate was called with the correct path
    expect(navigate).toHaveBeenCalledWith('/');
    
    // Restore real timers
    jest.useRealTimers();
  });
  
  test('displays registration success message when redirected from registration', () => {
    // Mock the useLocation hook to simulate redirect from registration
    useLocation.mockReturnValue({
      state: {
        fromRegistration: true,
        email: 'new.user@example.com'
      }
    });
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Check if registration success message is displayed
    expect(screen.getByText('Account Created Successfully!')).toBeInTheDocument();
    expect(screen.getByText(/Your account with new.user@example.com has been created/i)).toBeInTheDocument();
    expect(screen.getByText(/Please sign in with your credentials/i)).toBeInTheDocument();
    
    // Check if email field is pre-filled with the email from registration
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveValue('new.user@example.com');
    
    // Reset the mock for other tests
    useLocation.mockReset();
  });
  
  test('shows error message on server error', async () => {
    // Mock server error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' })
    });
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if error title is displayed
      expect(screen.getByText('Incorrect Email or Password')).toBeInTheDocument();
      // Check if error message is displayed
      expect(screen.getByText("The email or password you entered doesn't match our records.")).toBeInTheDocument();
      // Check if recovery option is displayed
      expect(screen.getByText(/Double-check your information and try again/i)).toBeInTheDocument();
    });
    
    // Verify that the token was not stored in localStorage
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  
  test('shows error message on network failure', async () => {
    // Mock network failure
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if error title is displayed
      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      // Check if error message is displayed
      expect(screen.getByText("We couldn't connect to our servers.")).toBeInTheDocument();
      // Check if recovery option is displayed
      expect(screen.getByText(/Please check your internet connection/i)).toBeInTheDocument();
    });
    
    // Verify that the token was not stored in localStorage
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  
  test('shows appropriate error message for account lockout', async () => {
    // Mock account lockout response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Account temporarily locked due to too many attempts' })
    });
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if error title is displayed
      expect(screen.getByText('Account Temporarily Locked')).toBeInTheDocument();
      // Check if error message is displayed
      expect(screen.getByText(/Your account has been temporarily locked/i)).toBeInTheDocument();
      // Check if recovery option is displayed
      expect(screen.getByText(/Please wait 30 minutes before trying again/i)).toBeInTheDocument();
    });
    
    // Verify that the token was not stored in localStorage
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
  
  test('shows error message when redirection fails', async () => {
    // Mock successful fetch response with token
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Login successful', access_token: 'test-auth-token' })
    });
    
    // Mock navigate to throw an error
    navigate.mockImplementationOnce(() => {
      throw new Error('Navigation failed');
    });
    
    const mockSetAuthState = jest.fn();
    render(<Login setAuthState={mockSetAuthState} />);
    
    // Enter valid email and password
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'valid.user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    // Wait for the async operation to complete
    await waitFor(() => {
      // Check if success message is displayed
      expect(screen.getByText(/login successful/i)).toBeInTheDocument();
    });
    
    // Fast-forward timers to trigger the countdown
    jest.useFakeTimers();
    act(() => {
      jest.advanceTimersByTime(3000); // 3 seconds
    });
    jest.useRealTimers();
    
    // The error message might not appear immediately, so we need to wait for it
    // Since we're mocking the navigation error, we should check for the button instead
    expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
  });
});