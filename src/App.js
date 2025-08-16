import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Registration from './components/Registration';
import Login from './components/Login';
import Home from './components/Home';
import MyTodos from './components/MyTodos';
import Navbar from './components/Navbar';
import GhostLoader from './components/GhostLoader';

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
    sessionExpired: false,
    error: null
  });

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      // If no token, user is not authenticated
      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          sessionExpired: false,
          error: null
        });
        return;
      }
      
      // Make request to auth endpoint
      const response = await fetch(
        'https://identity-service-365603594789.europe-west1.run.app/api/v1/auth/me',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Handle different response statuses
      if (response.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('authToken'); // Clear invalid token
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          sessionExpired: true,
          error: null
        });
        return;
      } else if (!response.ok) {
        // Other error responses
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          sessionExpired: false,
          error: `Server error: ${response.status}`
        });
        return;
      }
      
      // Parse user data from response
      const userData = await response.json();
      
      // Update auth state with user data
      setAuthState({
        isAuthenticated: true,
        user: userData,
        loading: false,
        sessionExpired: false,
        error: null
      });
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        sessionExpired: false,
        error: 'Network error: Unable to validate authentication'
      });
    }
  };

  // Check authentication status on page load/refresh
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Note: We're intentionally disabling the exhaustive-deps rule here
  // as we only want to run this effect once on component mount

  // Redirect component for session expiration
  const RedirectHandler = () => {
    const location = useLocation();
    
    // If session expired and user is not already on home page, redirect to home
    if (authState.sessionExpired && location.pathname !== '/') {
      return <Navigate to="/" replace />;
    }
    
    return null;
  };

  return (
    <Router>
      <div className="App">
        {/* Render RedirectHandler to handle session expiration redirects */}
        <RedirectHandler />
        
        {/* Show error message if authentication check failed */}
        {authState.error && (
          <div className="auth-error-banner">
            {authState.error}
          </div>
        )}
        
        {/* Navbar is always visible, regardless of authentication state */}
        <Navbar authState={authState} />
        
        {/* Show loading state only for the content area while authentication is being validated */}
        <div className="content-container">
          {authState.loading ? (
            <GhostLoader />
          ) : (
          <Routes>
            <Route path="/" element={<Home isAuthenticated={authState.isAuthenticated} />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/login" element={<Login setAuthState={setAuthState} />} />
            <Route
              path="/mytodos"
              element={
                authState.isAuthenticated ?
                <MyTodos /> :
                <Login setAuthState={setAuthState} />
              }
            />
          </Routes>
          )}
        </div>
      </div>
    </Router>
  );
}

export default App;
