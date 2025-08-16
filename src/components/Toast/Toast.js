import React, { useEffect } from 'react';
import './Toast.css';

// Icons for different toast types
const icons = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M0 0h24v24H0V0z" fill="none"/>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  )
};

const Toast = ({ id, type = 'info', message, onClose, autoClose = true, autoCloseTime = 5000 }) => {
  useEffect(() => {
    // Auto-close the toast after specified time
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, autoCloseTime);
      
      // Clear the timeout if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [id, onClose, autoClose, autoCloseTime]);

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-icon">
        {icons[type]}
      </div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
      <button 
        className="toast-close" 
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
        </svg>
      </button>
    </div>
  );
};

export default Toast;