import React, { useState } from 'react';
import sliitLogo from '../assets/SLIIT-3.png';
import tennisLogo from '../assets/tennis-logo.png';
import AuthModal from './AuthModal';
import '../styles/Navbar.css';

const Navbar = () => {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="logo-container">
          <img src={sliitLogo} alt="SLIIT Logo" className="logo-img" />
          <div className="logo-divider" />
          <img src={tennisLogo} alt="SLIIT Tennis Club" className="logo-img logo-img--tennis" />
          <div className="logo-text">
            <span className="logo-subtitle">SLIIT Tennis</span>
            <span className="logo-title">Management System</span>
          </div>
        </div>
        <div>
          <button className="login-btn" onClick={() => setShowAuth(true)}>
            Login
          </button>
        </div>
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Navbar;