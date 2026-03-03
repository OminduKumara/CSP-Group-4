import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

export default function Signup() {

  const auth = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    identityNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData(Object.assign({}, formData, {
      [e.target.name]: e.target.value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await auth.signup(
      formData.username,
      formData.identityNumber,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      navigate('/login');
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
      React.createElement('h2', null, 'Sign Up'),
      error && React.createElement('div', { className: 'error-message' }, error),
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement('input', { name: 'username', placeholder: 'Username', onChange: handleChange, required: true }),
        React.createElement('input', { name: 'identityNumber', placeholder: 'Identity Number', onChange: handleChange, required: true }),
        React.createElement('input', { name: 'email', type: 'email', placeholder: 'Email', onChange: handleChange, required: true }),
        React.createElement('input', { name: 'password', type: 'password', placeholder: 'Password', onChange: handleChange, required: true }),
        React.createElement('input', { name: 'confirmPassword', type: 'password', placeholder: 'Confirm Password', onChange: handleChange, required: true }),
        React.createElement('button', { type: 'submit', disabled: loading }, loading ? 'Signing up...' : 'Sign Up')
      ),
      React.createElement(Link, { to: '/login' }, 'Login')
    )
  );
}