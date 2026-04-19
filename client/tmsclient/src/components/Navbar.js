import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sliitLogo from '../assets/SLIIT-3.png';
import tennisLogo from '../assets/tennis-logo.png';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const isAdminRole = (role) => {
    const normalizedRole = String(role || '').trim().toLowerCase();
    return normalizedRole === 'admin' || normalizedRole === 'systemadmin';
  };

  const handlePrimaryAction = () => {
    if (auth.isAuthenticated) {
      navigate(isAdminRole(auth.user?.role) ? '/admin' : '/dashboard');
      return;
    }
    setShowAuth(true);
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm('Are you sure you want to log out?');
    if (!shouldLogout) return;
    auth.logout();
    navigate('/');
  };

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
        <div className="navbar-actions">
          <button className="login-btn" onClick={handlePrimaryAction}>
            {auth.isAuthenticated ? 'Dashboard' : 'Login'}
          </button>
          {auth.isAuthenticated && (
            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Navbar;