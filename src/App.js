import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Registration from './components/Registration';
import Login from './components/Login';
import Home from './components/Home';
import MyTodos from './components/MyTodos';
import Navbar from './components/Navbar';

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
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
          loading: false
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
      
      // If response is not ok, token might be invalid or expired
      if (!response.ok) {
        localStorage.removeItem('authToken'); // Clear invalid token
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
        return;
      }
      
      // Parse user data from response
      const userData = await response.json();
      
      // Update auth state with user data
      setAuthState({
        isAuthenticated: true,
        user: userData,
        loading: false
      });
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  // Check authentication status on page load/refresh
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar authState={authState} />
        <div className="content-container">
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
        </div>
      </div>
    </Router>
  );
}

export default App;
