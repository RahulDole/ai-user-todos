import React, { useState } from 'react';
import './Registration.css';

function Registration() {
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
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
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
  const handleSubmit = (e) => {
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
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };
  
  return (
    <div className="registration-container">
      <h2>User Registration</h2>
      
      {isSubmitted ? (
        <div className="success-message">
          <h3>Registration Successful!</h3>
          <p>Thank you for registering with {formData.email}!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
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
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="password-requirements">
            <p>Password must:</p>
            <ul>
              <li>Be at least 8 characters long</li>
              <li>Contain at least one uppercase letter</li>
              <li>Contain at least one lowercase letter</li>
              <li>Contain at least one number</li>
            </ul>
          </div>
          
          <button type="submit" className="submit-btn">Register</button>
        </form>
      )}
    </div>
  );
}

export default Registration;