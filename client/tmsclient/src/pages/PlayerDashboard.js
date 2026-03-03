import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/PlayerDashboard.css';

function isAdminRole(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'systemadmin';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const auth = useAuth();
  const username = auth.user?.username || '';
  const role = auth.user?.role;
  const isAdmin = isAdminRole(role);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  if (isAdmin) return null;

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
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
          React.createElement('h3', null, 'Practice'),
          React.createElement('p', null, 'Practice schedule')
        ),
        React.createElement('div', { className: 'dashboard-card' },
          React.createElement('h3', null, 'Tournaments'),
          React.createElement('p', null, 'Tournaments')
        ),
        React.createElement('div', { className: 'dashboard-card' },
          React.createElement('h3', null, 'Matches'),
          React.createElement('p', null, 'Manage matches')
        ),
        React.createElement('div', { className: 'dashboard-card' },
          React.createElement('h3', null, 'Players'),
          React.createElement('p', null, 'Player profile')
        )
      )
    )
  );
}
