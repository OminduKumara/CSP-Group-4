import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Auth.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    identityNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const email = formData.email.toLowerCase();
    const isValidSliitEmail = email.endsWith('@sliit.lk') || email.endsWith('@my.sliit.lk');
    if (!isValidSliitEmail) {
      setError('Email must end with @sliit.lk or @my.sliit.lk');
      return;
    }

    const hasLetters = /[a-zA-Z]/.test(formData.identityNumber);
    const hasNumbers = /\d/.test(formData.identityNumber);
    if (!hasLetters || !hasNumbers) {
      setError('Identity number must contain both letters and numbers');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.signup(
        formData.username,
        formData.identityNumber,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      setSuccessMessage('Registration submitted. Wait for admin approval before login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'auth-container' },
    React.createElement('div', { className: 'auth-card' },
      React.createElement('h2', null, 'Tennis Management System'),
      React.createElement('h3', null, 'Sign Up'),
      error && React.createElement('div', { className: 'error-message' }, error),
      successMessage && React.createElement('div', { className: 'success-message' }, successMessage),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'username' }, 'Username'),
          React.createElement('input', {
            type: 'text',
            id: 'username',
            name: 'username',
            value: formData.username,
            onChange: handleChange,
            placeholder: 'Choose a username',
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'identityNumber' }, 'Identity Number'),
          React.createElement('input', {
            type: 'text',
            id: 'identityNumber',
            name: 'identityNumber',
            value: formData.identityNumber,
            onChange: handleChange,
            placeholder: 'Example: it23575776',
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'email' }, 'Email'),
          React.createElement('input', {
            type: 'email',
            id: 'email',
            name: 'email',
            value: formData.email,
            onChange: handleChange,
            placeholder: 'Example: nuwan.k@sliit.lk or it23575776@my.sliit.lk',
            required: true
          })
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'password' }, 'Password'),
          React.createElement('div', { className: 'password-field' },
            React.createElement('input', {
              type: showPassword ? 'text' : 'password',
              id: 'password',
              name: 'password',
              value: formData.password,
              onChange: handleChange,
              placeholder: 'Create a password (min 6 characters)',
              required: true
            }),
            React.createElement('button', {
              type: 'button',
              className: 'toggle-password-btn',
              onClick: () => setShowPassword(!showPassword)
            }, showPassword ? 'Hide' : 'Show')
          )
        ),
        React.createElement('div', { className: 'form-group' },
          React.createElement('label', { htmlFor: 'confirmPassword' }, 'Confirm Password'),
          React.createElement('div', { className: 'password-field' },
            React.createElement('input', {
              type: showConfirmPassword ? 'text' : 'password',
              id: 'confirmPassword',
              name: 'confirmPassword',
              value: formData.confirmPassword,
              onChange: handleChange,
              placeholder: 'Confirm your password',
              required: true
            }),
            React.createElement('button', {
              type: 'button',
              className: 'toggle-password-btn',
              onClick: () => setShowConfirmPassword(!showConfirmPassword)
            }, showConfirmPassword ? 'Hide' : 'Show')
          )
        ),
        React.createElement('button', { type: 'submit', disabled: loading, className: 'submit-btn' },
          loading ? 'Signing up...' : 'Sign Up'
        )
      ),
      React.createElement('p', { className: 'auth-link' },
        'Already have an account? ',
        React.createElement(Link, { to: '/login' }, 'Login here')
      )
    )
  );
}
