import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ authState }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, loading } = authState || { isAuthenticated: false, user: null, loading: true };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Remove auth token from localStorage
    localStorage.removeItem('authToken');
    // Reload the page to reset the auth state
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          To Do List
        </Link>

        {isAuthenticated && user && (
          <div className="welcome-message">
            Welcome, {user.email}!
          </div>
        )}

        <div className="menu-icon" onClick={toggleMenu}>
          <div className={`menu-icon-bar ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`menu-icon-bar ${isMenuOpen ? 'open' : ''}`}></div>
          <div className={`menu-icon-bar ${isMenuOpen ? 'open' : ''}`}></div>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Register
            </Link>
          </li>
          {!isAuthenticated && !loading && (
            <li className="nav-item">
              <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <li className="nav-item">
              <button className="nav-link logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;