import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Registration from './Registration';

describe('Registration Component', () => {
  test('renders registration form', () => {
    render(<Registration />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });
  
  test('displays validation errors for empty fields', () => {
    render(<Registration />);
    
    // Submit the form without filling in any fields
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation errors are displayed
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
  
  test('validates username requirements', () => {
    render(<Registration />);
    
    // Enter a short username
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/username must be at least 4 characters long/i)).toBeInTheDocument();
    
    // Enter a username with special characters
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user@name' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if validation error is displayed
    expect(screen.getByText(/username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
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
  
  test('shows success message on valid submission', () => {
    render(<Registration />);
    
    // Enter valid username and password
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'validuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'ValidPass123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    // Check if success message is displayed
    expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    expect(screen.getByText(/thank you for registering, validuser/i)).toBeInTheDocument();
  });
});