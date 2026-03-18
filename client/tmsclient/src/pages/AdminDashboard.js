import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TournamentManagement from '../components/TournamentManagement';
import TournamentCalendar from '../components/TournamentCalendar';
import TournamentBracket from '../components/TournamentBracket';
import LiveScoring from './LiveScoring';

import { API_ENDPOINTS } from '../config/api';
import '../styles/AdminDashboard.css';

const API_URL = API_ENDPOINTS.ADMIN;


function isAdminRole(role) {
  const normalizedRole = String(role || '').trim().toLowerCase();
  return normalizedRole === 'admin' || normalizedRole === 'systemadmin';
}

export default function AdminDashboard() {

  const navigate = useNavigate();
  const auth = useAuth();

  const username = auth.user?.username || '';
  const role = auth.user?.role;

  const [activeTab, setActiveTabRaw] = useState(
    () => sessionStorage.getItem('adminActiveTab') || 'tournaments'
  );
  const setActiveTab = (tab) => {
    sessionStorage.setItem('adminActiveTab', tab);
    setActiveTabRaw(tab);
  };
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tournamentRefresh, setTournamentRefresh] = useState(0);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {

    if (auth.loading) return;

    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAdminRole(role)) {
      navigate('/dashboard');
      return;
    }

    loadPending();

  }, [auth.loading, auth.isAuthenticated, role]);

  async function loadPending() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL + '/pending-approvals', {
        headers: {
          'Authorization': 'Bearer ' + auth.token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load pending requests');

      const data = await response.json();
      setPendingRequests(data.data || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id, username) {
    if (!window.confirm(`Approve registration for ${username}?`)) return;

    try {
      setError('');
      setSuccessMessage('');
      
      const response = await fetch(API_URL + '/approve-player/' + id, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + auth.token,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to approve registration');
      }

      setSuccessMessage(`Successfully approved ${username}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadPending();

    } catch (err) {
      setError(err.message || 'Failed to approve registration');
      setTimeout(() => setError(''), 5000);
    }
  }

  async function reject(id, username) {
    const reason = window.prompt(`Reject registration for ${username}? Enter reason (optional):`);

    if (reason === null) return;

    try {
      setError('');
      setSuccessMessage('');
      
      const response = await fetch(API_URL + '/reject-player/' + id, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + auth.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || 'No reason provided' })
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to reject registration');
      }

      setSuccessMessage(`Successfully rejected ${username}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadPending();

    } catch (err) {
      setError(err.message || 'Failed to reject registration');
      setTimeout(() => setError(''), 5000);
    }
  }

  function handleLogout() {
    auth.logout();
    navigate('/login');
  }

  function handleTournamentAdded() {
    setTournamentRefresh(prev => prev + 1);
  }

  return React.createElement(
    'div',
    { className: 'admin-dashboard-container' },

    React.createElement(
      'nav',
      { className: 'navbar' },
      React.createElement(
        'div',
        { className: 'nav-content' },
        React.createElement('h1', null, 'Admin Panel'),

        React.createElement('div', { className: 'nav-right' },
          React.createElement('span', { className: 'welcome-text' }, `Welcome, ${username}`),

          React.createElement('button',
            { className: 'back-btn', onClick: () => navigate('/dashboard') },
            'Dashboard'
          ),

          React.createElement('button',
            { className: 'logout-btn', onClick: handleLogout },
            'Logout'
          )
        )
      )
    ),

    React.createElement('div', { className: 'admin-content' },
      React.createElement('div', { className: 'tabs-container' },
        React.createElement('div', { className: 'tabs-nav' },
          React.createElement('button',
            {
              className: `tab-button ${activeTab === 'tournaments' ? 'active' : ''}`,
              onClick: () => setActiveTab('tournaments')
            },
            'Tournament Management'
          ),
          React.createElement('button',
            {
              className: `tab-button ${activeTab === 'calendar' ? 'active' : ''}`,
              onClick: () => setActiveTab('calendar')
            },
            'Tournament Calendar'
          ),
          React.createElement('button',
            {
              className: `tab-button ${activeTab === 'approvals' ? 'active' : ''}`,
              onClick: () => setActiveTab('approvals')
            },
            'Player Approvals'
          ),
          React.createElement('button',
            {
              className: `tab-button ${activeTab === 'bracket' ? 'active' : ''}`,
              onClick: () => setActiveTab('bracket')
            },
            'Tournament Bracket'
          ),
          React.createElement('button',
            {
              className: `tab-button ${activeTab === 'live-scoring' ? 'active' : ''}`,
              onClick: () => setActiveTab('live-scoring')
            },
            'Live Scoring'
          )
        ),

        React.createElement('div', { className: 'tabs-content' }, [
          activeTab === 'tournaments' && React.createElement(
            TournamentManagement,
            { token: auth.token, onTournamentAdded: handleTournamentAdded, key: "tab-tournaments" }
          ),

          activeTab === 'calendar' && React.createElement(
            TournamentCalendar,
            { token: auth.token, refreshTrigger: tournamentRefresh, key: "tab-calendar" }
          ),

          activeTab === 'bracket' && React.createElement(
            TournamentBracket,
            {
              token: auth.token,
              key: "tab-bracket",
              onOpenLiveScoring: () => setActiveTab('live-scoring')
            }
          ),

          activeTab === 'live-scoring' && React.createElement(
            LiveScoring,
            { key: "tab-live-scoring" }
          ),

          activeTab === 'approvals' && React.createElement('div', { className: 'approvals-tab', key: "tab-approvals" },
            React.createElement('h2', null, 'Pending Registration Requests'),

            error && React.createElement('div', { className: 'error-message' }, error),
            successMessage && React.createElement('div', { className: 'success-message' }, successMessage),

            loading
              ? React.createElement('div', { className: 'loading' }, 'Loading...')
              : pendingRequests.length === 0
                ? React.createElement('div', { className: 'no-requests' },
                  React.createElement('p', null, 'No pending registration requests')
                )
                : React.createElement('div', { className: 'requests-table' },
                  React.createElement('table', null,
                    React.createElement('thead', null,
                      React.createElement('tr', null,
                        React.createElement('th', null, 'Username'),
                        React.createElement('th', null, 'Identity Number'),
                        React.createElement('th', null, 'Email'),
                        React.createElement('th', null, 'Requested Date'),
                        React.createElement('th', null, 'Actions')
                      )
                    ),
                    React.createElement('tbody', null,
                      pendingRequests.map(req =>
                        React.createElement('tr', { key: req.id },
                          React.createElement('td', null, req.username),
                          React.createElement('td', null, req.identityNumber),
                          React.createElement('td', null, req.email),
                          React.createElement('td', null,
                            new Date(req.createdAt).toLocaleDateString()
                          ),

                          React.createElement('td', null,
                            React.createElement('div', { className: 'actions-cell' },
                              React.createElement('button',
                                { 
                                  className: 'approve-btn',
                                  onClick: () => approve(req.id, req.username) 
                                },
                                'Approve'
                              ),

                              React.createElement('button',
                                { 
                                  className: 'reject-btn',
                                  onClick: () => reject(req.id, req.username) 
                                },
                                'Reject'
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
          )
        ])
      )
    )
  );
}