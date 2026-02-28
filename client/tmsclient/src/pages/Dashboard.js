import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const username = authService.getUsername();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'Admin' || role === 'SystemAdmin';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return React.createElement('div', { className: 'dashboard-container' },
    React.createElement('nav', { className: 'navbar' },
      React.createElement('div', { className: 'nav-content' },
        React.createElement('h1', null, 'Tennis Management System'),
        React.createElement('div', { className: 'nav-right' },
          React.createElement('span', { className: 'welcome-text' }, `Welcome, ${username}!`),
          isAdmin && React.createElement('button', { 
            onClick: () => navigate('/admin'), 
            className: 'admin-btn' 
          }, 'Admin Panel'),
          React.createElement('button', { onClick: handleLogout, className: 'logout-btn' }, 'Logout')
        )
      )
    ),
    React.createElement('div', { className: 'dashboard-content' },
      React.createElement('h2', null, 'Dashboard'),
      React.createElement('p', null, 'Welcome to the Tennis Management System!'),
      React.createElement('div', { className: 'dashboard-grid' },
        React.createElement('div', { className: 'dashboard-card' },
          React.createElement('h3', null, 'Users'),
          React.createElement('p', null, 'Manage users')
        ),
        React.createElement('div', { className: 'dashboard-card' },
          React.createElement('h3', null, 'Tournaments'),
          React.createElement('p', null, 'Manage tournaments')
        ),
        React.createElement('div', { className: 'dashboard-card' },
          React.createElement('h3', null, 'Matches'),
          React.createElement('p', null, 'Manage matches')
        ),
        React.createElement('div', { className: 'dashboard-card' },
          React.createElement('h3', null, 'Players'),
          React.createElement('p', null, 'Manage players')
        )
      )
    )
  );
}
