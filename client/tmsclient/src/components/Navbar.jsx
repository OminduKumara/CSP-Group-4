import React from 'react';
import { Link } from 'react-router-dom';
import sliitLogo from '../assets/sliit-logo.png';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={sliitLogo} alt="SLIIT Logo" className="logo-img" />
        <div className="logo-text">
          <span className="logo-title">Sri Lanka Institute of Information Technology</span>
          <span className="logo-subtitle">SLIIT Tennis</span>
        </div>
      </div>
      <div>
        {/* Navigates to the login page */}
        <Link to="/login" className="login-btn">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;