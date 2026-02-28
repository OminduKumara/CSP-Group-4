import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const username = authService.getUsername();
  const role = localStorage.getItem('role');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (role !== 'Admin' && role !== 'SystemAdmin') {
      navigate('/dashboard');
      return;
    }
    
    loadPendingRequests();
  }, [role, navigate]);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const requests = await adminService.getPendingRegistrations();
      setPendingRequests(requests);
    } catch (err) {
      setError(err.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, username) => {
    if (!window.confirm(`Approve registration for ${username}?`)) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');
      await adminService.approveRegistration(userId);
      setSuccessMessage(`Successfully approved ${username}`);
      loadPendingRequests();
    } catch (err) {
      setError(err.message || 'Failed to approve registration');
    }
  };

  const handleReject = async (userId, username) => {
    const reason = window.prompt(`Reject registration for ${username}?\n\nEnter reason (optional):`);
    if (reason === null) {
      return; // User cancelled
    }

    try {
      setError('');
      setSuccessMessage('');
      await adminService.rejectRegistration(userId, reason);
      setSuccessMessage(`Successfully rejected ${username}`);
      loadPendingRequests();
    } catch (err) {
      setError(err.message || 'Failed to reject registration');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return React.createElement('div', { className: 'admin-dashboard-container' },
    React.createElement('nav', { className: 'navbar' },
      React.createElement('div', { className: 'nav-content' },
        React.createElement('h1', null, 'Admin Panel - Tennis Management System'),
        React.createElement('div', { className: 'nav-right' },
          React.createElement('span', { className: 'welcome-text' }, `Welcome, ${username} (${role})`),
          React.createElement('button', { 
            onClick: () => navigate('/dashboard'), 
            className: 'back-btn' 
          }, 'Back to Dashboard'),
          React.createElement('button', { onClick: handleLogout, className: 'logout-btn' }, 'Logout')
        )
      )
    ),
    React.createElement('div', { className: 'admin-content' },
      React.createElement('h2', null, 'Pending Player Registrations'),
      error && React.createElement('div', { className: 'error-message' }, error),
      successMessage && React.createElement('div', { className: 'success-message' }, successMessage),
      
      loading ? React.createElement('div', { className: 'loading' }, 'Loading...') :
      pendingRequests.length === 0 ? 
        React.createElement('div', { className: 'no-requests' }, 
          React.createElement('p', null, 'No pending registration requests')
        ) :
        React.createElement('div', { className: 'requests-table' },
          React.createElement('table', null,
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', null, 'Username'),
                React.createElement('th', null, 'Identity Number'),
                React.createElement('th', null, 'Email'),
                React.createElement('th', null, 'Registration Date'),
                React.createElement('th', null, 'Actions')
              )
            ),
            React.createElement('tbody', null,
              pendingRequests.map(request =>
                React.createElement('tr', { key: request.id },
                  React.createElement('td', null, request.username),
                  React.createElement('td', null, request.identityNumber),
                  React.createElement('td', null, request.email),
                  React.createElement('td', null, new Date(request.createdAt).toLocaleDateString()),
                  React.createElement('td', { className: 'actions-cell' },
                    React.createElement('button', {
                      onClick: () => handleApprove(request.id, request.username),
                      className: 'approve-btn'
                    }, 'Approve'),
                    React.createElement('button', {
                      onClick: () => handleReject(request.id, request.username),
                      className: 'reject-btn'
                    }, 'Reject')
                  )
                )
              )
            )
          )
        )
    )
  );
}
