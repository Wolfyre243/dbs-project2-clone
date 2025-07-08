import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userToken'));

  useEffect(() => {
    const updateLoginState = () => {
      const token = localStorage.getItem('userToken');
      console.log('Navbar: Updating login state. Token:', token);
      setIsLoggedIn(!!token);
    };

    // Check login state on mount
    updateLoginState();

    // Listen for focus and custom loginStateChange events
    const handleFocus = () => updateLoginState();
    const handleLoginStateChange = () => updateLoginState();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('loginStateChange', handleLoginStateChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('loginStateChange', handleLoginStateChange);
    };
  }, []);

  // Add this function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
<div className="logo">USM</div>
      <button
        className="hamburger"
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
        onClick={toggleMenu}
      >
        &#9776;
      </button>
      <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
<li><a href="/dashboard">Dashboard</a></li>
<li><a href="/dashboard/manage-users">Manage Users</a></li>
<li><a href="/about-us">About Us</a></li>
<li><a href="/contact-us">Contact Us</a></li>
{isLoggedIn && (
  <li>
    <button
      onClick={handleLogout}
      className="logout-button"
    >
      Logout
    </button>
  </li>
)}
      </ul>
    </nav>
  );
};

export default Navbar;
