import React, { createContext, useContext, useReducer, useCallback } from 'react';
import Toast from './Toast';
import './Toast.css';

// Create context
const ToastContext = createContext();

// Action types
const ADD_TOAST = 'ADD_TOAST';
const REMOVE_TOAST = 'REMOVE_TOAST';

// Initial state
const initialState = {
  toasts: []
};

// Reducer function
const toastReducer = (state, action) => {
  switch (action.type) {
    case ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };
    case REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
    default:
      return state;
  }
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  // Generate a unique ID for each toast
  const generateId = () => {
    return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Add a new toast
  const addToast = useCallback((message, type = 'info', options = {}) => {
    const id = generateId();
    const toast = {
      id,
      message,
      type,
      ...options
    };
    
    dispatch({ type: ADD_TOAST, payload: toast });
    return id;
  }, []);

  // Remove a toast by ID
  const removeToast = useCallback((id) => {
    dispatch({ type: REMOVE_TOAST, payload: id });
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options) => {
    return addToast(message, 'success', options);
  }, [addToast]);

  const error = useCallback((message, options) => {
    return addToast(message, 'error', options);
  }, [addToast]);

  const info = useCallback((message, options) => {
    return addToast(message, 'info', options);
  }, [addToast]);

  const warning = useCallback((message, options) => {
    return addToast(message, 'warning', options);
  }, [addToast]);

  // Value to be provided to consumers
  const value = {
    toasts: state.toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Render the toast container and toasts */}
      {state.toasts.length > 0 && (
        <div className="toast-container" role="region" aria-live="polite">
          {state.toasts.map(toast => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={removeToast}
              autoClose={toast.autoClose !== undefined ? toast.autoClose : true}
              autoCloseTime={toast.autoCloseTime || 5000}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;