import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

function isAdminRole(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'systemadmin';
}

export default function Login() {

  const auth = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await auth.login(identifier, password);

    if (result.success) {
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

  return React.createElement(
    'div',
    { className: 'auth-container' },
    React.createElement(
      'div',
      { className: 'auth-card' },
      React.createElement('h2', null, 'Login'),
      error && React.createElement('div', { className: 'error-message' }, error),
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement('input', {
          type: 'text',
          placeholder: 'Email or Identity Number',
          value: identifier,
          onChange: function (e) { setIdentifier(e.target.value); },
          required: true
        }),
        React.createElement('input', {
          type: 'password',
          placeholder: 'Password',
          value: password,
          onChange: function (e) { setPassword(e.target.value); },
          required: true
        }),
        React.createElement(
          'button',
          { type: 'submit', disabled: loading },
          loading ? 'Logging in...' : 'Login'
        )
      ),
      React.createElement(Link, { to: '/signup' }, 'Sign Up')
    )
  );
}