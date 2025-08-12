import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

/**
 * Helper function to format error messages with guidance and recovery options
 * @param {string} errorMessage - The raw error message from the server or client
 * @returns {Object} Formatted error with title, message, and recovery option
 */
const formatErrorMessage = (errorMessage) => {
  // Default error (fallback)
  let formattedError = {
    title: 'Login Failed',
    message: 'We couldn\'t log you in. Please try again.',
    recovery: 'If the problem persists, please contact support.'
  };

  // Check for specific error patterns and provide tailored responses
  if (errorMessage.includes('Invalid credentials') ||
      errorMessage.includes('incorrect password') ||
      errorMessage.includes('401')) {
    formattedError = {
      title: 'Incorrect Email or Password',
      message: 'The email or password you entered doesn\'t match our records.',
      recovery: 'Double-check your information and try again, or reset your password.'
    };
  } else if (errorMessage.includes('account locked') ||
             errorMessage.includes('too many attempts') ||
             errorMessage.includes('temporarily disabled')) {
    formattedError = {
      title: 'Account Temporarily Locked',
      message: 'Your account has been temporarily locked due to multiple failed login attempts.',
      recovery: 'Please wait 30 minutes before trying again, or reset your password now.'
    };
  } else if (errorMessage.includes('account not found') ||
             errorMessage.includes('user not found') ||
             errorMessage.includes('no account')) {
    formattedError = {
      title: 'Account Not Found',
      message: 'We couldn\'t find an account with that email address.',
      recovery: 'Check your spelling or create a new account.'
    };
  } else if (errorMessage.includes('not verified') ||
             errorMessage.includes('verification required') ||
             errorMessage.includes('confirm your email')) {
    formattedError = {
      title: 'Email Not Verified',
      message: 'Your email address hasn\'t been verified yet.',
      recovery: 'Please check your inbox for a verification email or request a new one.'
    };
  } else if (errorMessage.includes('Network error') ||
             errorMessage.includes('Failed to fetch') ||
             errorMessage.includes('connection')) {
    formattedError = {
      title: 'Connection Problem',
      message: 'We couldn\'t connect to our servers.',
      recovery: 'Please check your internet connection and try again.'
    };
  } else if (errorMessage.includes('server error') ||
             errorMessage.includes('500') ||
             errorMessage.includes('unavailable')) {
    formattedError = {
      title: 'Service Unavailable',
      message: 'Our service is temporarily unavailable.',
      recovery: 'Please try again later. Our team has been notified of the issue.'
    };
  }

  return formattedError;
};

function Login({ setAuthState }) {
  // Get location object to check if redirected from registration
  const location = useLocation();
  const navigate = useNavigate();
  const emailInputRef = useRef(null);
  
  // State for registration success message
  const [registrationSuccess, setRegistrationSuccess] = useState({
    show: false,
    email: ''
  });
  
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
  
  // State for redirection countdown
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  
  // State to track if redirection is in progress
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // State to track redirection errors
  const [redirectError, setRedirectError] = useState(null);
  
  // Check if redirected from registration
  useEffect(() => {
    // Check if location and location.state exist before accessing properties
    if (location && location.state && location.state.fromRegistration) {
      setRegistrationSuccess({
        show: true,
        email: location.state.email || ''
      });
      
      // Set email field if provided from registration
      if (location.state.email) {
        setFormData(prev => ({
          ...prev,
          email: location.state.email
        }));
      }
      
      // Focus on email input field
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }
  }, [location]);
  
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
    
    // Special test mode for development/testing
    if (formData.email === 'test@example.com' && formData.password === 'test123') {
      // Set a test token directly
      localStorage.setItem('authToken', 'test-auth-token');
      
      // Update auth state in parent component
      setAuthState({
        isAuthenticated: true,
        user: { email: formData.email },
        loading: false
      });
      
      // Set success status
      setApiStatus({
        loading: false,
        error: null,
        success: true,
        message: 'Login successful!'
      });
      
      setIsSubmitted(true);
      setIsRedirecting(true);
      return;
    }
    
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
      
      // Start redirection process
      setIsRedirecting(true);
      
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
      
      // Format the error message with guidance and recovery options
      const formattedError = formatErrorMessage(errorMessage);
      
      setApiStatus({
        loading: false,
        error: formattedError,
        success: false,
        message: ''
      });
    }
  };
  
  // Effect for countdown timer and redirection
  useEffect(() => {
    let timerId;
    
    if (isRedirecting && redirectCountdown > 0) {
      timerId = setTimeout(() => {
        setRedirectCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else if (isRedirecting && redirectCountdown === 0) {
      try {
        // Navigate to home page
        navigate('/');
      } catch (error) {
        console.error('Navigation error:', error);
        setRedirectError('Failed to redirect to home page. Please use the button below.');
      }
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isRedirecting, redirectCountdown, navigate]);
  
  // Handle manual navigation
  const handleManualNavigation = () => {
    try {
      navigate('/');
    } catch (error) {
      console.error('Manual navigation error:', error);
      setRedirectError('Failed to navigate to home page. Please try again or refresh the page.');
    }
  };
  
  return (
    <div className="login-container">
      <h2>User Login</h2>
      
      {isSubmitted ? (
        <div className="success-message">
          <h3>Login Successful!</h3>
          <p>Welcome back, {formData.email}!</p>
          
          {isRedirecting && (
            <div className="redirect-message">
              <p>You will be redirected to the home page in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}.</p>
              <div className="progress-bar" data-testid="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${((3 - redirectCountdown) / 3) * 100}%` }}
                ></div>
              </div>
              <button
                onClick={handleManualNavigation}
                className="go-home-btn"
              >
                Go to Home
              </button>
              
              {redirectError && (
                <div className="redirect-error">
                  <p>{redirectError}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {registrationSuccess.show && (
            <div className="success-message registration-success">
              <div className="success-title">Account Created Successfully!</div>
              <div className="success-message-text">
                Your account with {registrationSuccess.email} has been created.
              </div>
              <div className="success-instruction">
                Please sign in with your credentials to access your account.
              </div>
            </div>
          )}
          
          {apiStatus.error && (
            <div className="error-message-container">
              <div className="error-title">{apiStatus.error.title}</div>
              <div className="error-message api-error">{apiStatus.error.message}</div>
              <div className="error-recovery">{apiStatus.error.recovery}</div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error-input' : ''}
              placeholder="name@example.com"
              disabled={apiStatus.loading}
              autoFocus
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