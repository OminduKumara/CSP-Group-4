import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthModal.css';

function isAdminRole(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'systemadmin';
}

export default function AuthModal({ isOpen, onClose }) {
  const auth = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* Login fields */
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  /* Signup fields */
  const [signupData, setSignupData] = useState({
    username: '',
    identityNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  function resetForms() {
    setIdentifier('');
    setPassword('');
    setSignupData({ username: '', identityNumber: '', email: '', password: '', confirmPassword: '' });
    setError('');
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setError('');
  }

  /* ---- Login handler ---- */
  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await auth.login(identifier, password);

    if (result.success) {
      resetForms();
      onClose();
      const role = result.user?.role;
      if (isAdminRole(role)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  /* ---- Signup handler ---- */
  async function handleSignup(e) {
    e.preventDefault();
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await auth.signup(
      signupData.username,
      signupData.identityNumber,
      signupData.email,
      signupData.password,
      signupData.confirmPassword
    );

    if (result.success) {
      resetForms();
      setActiveTab('login');
      setError('');
      // Show a success message briefly
      setError('Account created! Please login.');
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  function handleSignupChange(e) {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  }

  function handleOverlayClick(e) {
    if (e.target.classList.contains('auth-modal__overlay')) {
      resetForms();
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="auth-modal__overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        {/* Close button */}
        <button className="auth-modal__close" onClick={() => { resetForms(); onClose(); }} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Tabs */}
        <div className="auth-modal__tabs">
          <button
            className={`auth-modal__tab ${activeTab === 'login' ? 'auth-modal__tab--active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Login
          </button>
          <button
            className={`auth-modal__tab ${activeTab === 'signup' ? 'auth-modal__tab--active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className={`auth-modal__message ${error.includes('created') ? 'auth-modal__message--success' : ''}`}>
            {error}
          </div>
        )}

        {/* ---- LOGIN FORM ---- */}
        {activeTab === 'login' && (
          <form className="auth-modal__form" onSubmit={handleLogin}>
            <div className="auth-modal__field">
              <label className="auth-modal__label">Email or Identity Number</label>
              <input
                type="text"
                className="auth-modal__input"
                placeholder="Enter email or ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="auth-modal__field">
              <label className="auth-modal__label">Password</label>
              <input
                type="password"
                className="auth-modal__input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-modal__submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
            <p className="auth-modal__switch">
              Don't have an account?{' '}
              <button type="button" className="auth-modal__switch-btn" onClick={() => switchTab('signup')}>
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* ---- SIGNUP FORM ---- */}
        {activeTab === 'signup' && (
          <form className="auth-modal__form" onSubmit={handleSignup}>
            <div className="auth-modal__field">
              <label className="auth-modal__label">Username</label>
              <input
                name="username"
                className="auth-modal__input"
                placeholder="Choose a username"
                value={signupData.username}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="auth-modal__field">
              <label className="auth-modal__label">Identity Number</label>
              <input
                name="identityNumber"
                className="auth-modal__input"
                placeholder="Your identity number"
                value={signupData.identityNumber}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="auth-modal__field">
              <label className="auth-modal__label">Email</label>
              <input
                name="email"
                type="email"
                className="auth-modal__input"
                placeholder="Your email address"
                value={signupData.email}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="auth-modal__field">
              <label className="auth-modal__label">Password</label>
              <input
                name="password"
                type="password"
                className="auth-modal__input"
                placeholder="Create a password"
                value={signupData.password}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="auth-modal__field">
              <label className="auth-modal__label">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="auth-modal__input"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                required
              />
            </div>
            <button type="submit" className="auth-modal__submit" disabled={loading}>
              {loading ? 'Signing up…' : 'Create Account'}
            </button>
            <p className="auth-modal__switch">
              Already have an account?{' '}
              <button type="button" className="auth-modal__switch-btn" onClick={() => switchTab('login')}>
                Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
