import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Auth.css';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(identifier, password);
      // Redirect based on role
      const role = response.role || localStorage.getItem('role');
      if (role === 'Admin' || role === 'SystemAdmin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'auth-container' },
    React.createElement('div', { className: 'auth-card' },
      React.createElement('h2', null, 'Tennis Management System'),
      React.createElement('h3', null, 'Login'),
      error && React.createElement('div', { className: 'error-message' }, error),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'identifier' }, 'Email or Identity Number'),
          React.createElement('input', {
            type: 'text',
            id: 'identifier',
            value: identifier,
            onChange: (e) => setIdentifier(e.target.value),
            placeholder: 'Enter email or identity number',
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'password' }, 'Password'),
          React.createElement('div', { className: 'password-field' },
            React.createElement('input', {
              type: showPassword ? 'text' : 'password',
              id: 'password',
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: 'Enter your password',
              required: true
            }),
            React.createElement('button', {
              type: 'button',
              className: 'toggle-password-btn',
              onClick: () => setShowPassword(!showPassword)
            }, showPassword ? 'Hide' : 'Show')
          )
        ),
        React.createElement('button', { type: 'submit', disabled: loading, className: 'submit-btn' },
          loading ? 'Logging in...' : 'Login'
        )
      ),
      React.createElement('p', { className: 'auth-link' },
        "Don't have an account? ",
        React.createElement(Link, { to: '/signup' }, 'Sign up here')
      )
    )
  );
}
