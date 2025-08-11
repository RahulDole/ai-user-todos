import React, { useState } from 'react';
import './Login.css';

function Login({ setAuthState }) {
  // State for form fields
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // State for form errors
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  
  // State for form submission
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State for API-related status
  const [apiStatus, setApiStatus] = useState({
    loading: false,
    error: null,
    success: false,
    message: ''
  });
  
  // Validate email
  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    
    // Email regex pattern to validate:
    // - Must contain @ symbol
    // - Must have characters before @ (local part)
    // - Must have domain after @ with at least one dot
    // - No illegal characters
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., name@example.com)';
    }
    
    return '';
  };
  
  // Validate password
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    return '';
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    setErrors({
      ...errors,
      [name]: ''
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      });
      return;
    }
    
    // Reset API status
    setApiStatus({
      loading: true,
      error: null,
      success: false,
      message: ''
    });
    
    try {
      // Make API call to login endpoint
      const response = await fetch(
        'https://identity-service-365603594789.europe-west1.run.app/api/v1/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );
      
      // Parse the response
      const data = await response.json();
      
      if (!response.ok) {
        // Handle error response from server
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      
      // Handle successful response
      setApiStatus({
        loading: false,
        error: null,
        success: true,
        message: 'Login successful!'
      });
      
      console.log('Login successful:', data);
      
      // Store the token in localStorage for session management
      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token);
        
        // Update auth state in parent component
        setAuthState({
          isAuthenticated: true,
          user: { email: formData.email },
          loading: false
        });
      }
      
      setIsSubmitted(true);
      
    } catch (error) {
      // Handle error response
      let errorMessage = 'Login failed. Please try again.';
      
      console.error('Login error:', error);
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setApiStatus({
        loading: false,
        error: errorMessage,
        success: false,
        message: ''
      });
    }
  };
  
  return (
    <div className="login-container">
      <h2>User Login</h2>
      
      {isSubmitted ? (
        <div className="success-message">
          <h3>Login Successful!</h3>
          <p>Welcome back, {formData.email}!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {apiStatus.error && (
            <div className="error-message api-error">
              {apiStatus.error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error-input' : ''}
              placeholder="name@example.com"
              disabled={apiStatus.loading}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error-input' : ''}
              disabled={apiStatus.loading}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={apiStatus.loading}
          >
            {apiStatus.loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Login;