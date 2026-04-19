import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TournamentManagement from '../components/TournamentManagement';
import TournamentCalendar from '../components/TournamentCalendar';
import TournamentBracket from '../components/TournamentBracket';
import LiveScoring from './LiveScoring';
import InventoryPage from './InventoryPage';
import PracticeSessionManagement from '../components/PracticeSessionManagement';
import AdminAttendanceManagement from '../components/AdminAttendanceManagement';
import AttendanceReport from '../components/AttendanceReport';
import SystemStatus from '../components/SystemStatus';
import { 
  Trophy, 
  Calendar, 
  Layout, 
  Activity, 
  Package, 
  History, 
  Users, 
  Settings, 
  FileText,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import InnerNavbar from '../components/InnerNavbar';

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
  
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerForm, setPlayerForm] = useState({
    username: '', email: '', identityNumber: '', contactNumber: '',
    address: '', role: 3, isApproved: true, newPassword: ''
  });
  const [playersError, setPlayersError] = useState('');
  const [playersSuccess, setPlayersSuccess] = useState('');
  const [savingPlayer, setSavingPlayer] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [tournamentRefresh, setTournamentRefresh] = useState(0);

  useEffect(() => {
    if (auth.loading) return;
    if (!auth.isAuthenticated) {
      navigate('/');
      return;
    }
    if (!isAdminRole(role)) {
      navigate('/dashboard');
      return;
    }
    loadPending();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function loadPlayers() {
    try {
      setPlayersLoading(true);
      setPlayersError('');
      const response = await fetch(API_URL + '/users?role=Player', {
        headers: {
          'Authorization': 'Bearer ' + auth.token,
          'Content-Type': 'application/json'
        }
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.message || 'Failed to load players');
      setPlayers(responseData.data || []);
    } catch (err) {
      setPlayersError(err.message || 'Failed to load players');
    } finally {
      setPlayersLoading(false);
    }
  }

  async function openPlayerDetails(playerId) {
    try {
      setPlayersError('');
      setPlayersSuccess('');
      const response = await fetch(API_URL + '/users/' + playerId, {
        headers: {
          'Authorization': 'Bearer ' + auth.token,
          'Content-Type': 'application/json'
        }
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.message || 'Failed to load player details');
      const player = responseData.data;
      setSelectedPlayerId(playerId);
      setSelectedPlayer(player);
      setPlayerForm({
        username: player.username || '', email: player.email || '',
        identityNumber: player.identityNumber || '', contactNumber: player.contactNumber || '',
        address: player.address || '', role: Number(player.role) || 3,
        isApproved: !!player.isApproved, newPassword: ''
      });
    } catch (err) {
      setPlayersError(err.message || 'Failed to load player details');
    }
  }

  function handlePlayerFormChange(event) {
    const { name, value, type, checked } = event.target;
    setPlayerForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'role' ? Number(value) : value)
    }));
  }

  async function savePlayerChanges() {
    if (!selectedPlayerId) return;
    try {
      setSavingPlayer(true);
      setPlayersError('');
      setPlayersSuccess('');
      const payload = {
        username: playerForm.username.trim(), email: playerForm.email.trim(),
        identityNumber: playerForm.identityNumber.trim(), contactNumber: playerForm.contactNumber.trim(),
        address: playerForm.address.trim(), role: playerForm.role,
        isApproved: playerForm.isApproved, newPassword: playerForm.newPassword.trim()
      };
      const response = await fetch(API_URL + '/users/' + selectedPlayerId, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + auth.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.message || 'Failed to save player details');
      setPlayersSuccess(responseData.message || 'Player details updated successfully');
      if (responseData.data) setSelectedPlayer(responseData.data);
      setPlayerForm(prev => ({ ...prev, newPassword: '' }));
      loadPlayers();
    } catch (err) {
      setPlayersError(err.message || 'Failed to save player details');
    } finally {
      setSavingPlayer(false);
    }
  }

  async function approve(id, username) {
    if (!window.confirm(`Approve registration for ${username}?`)) return;
    try {
      setError(''); setSuccessMessage('');
      const response = await fetch(API_URL + '/approve-player/' + id, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + auth.token, 'Content-Type': 'application/json' }
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.message || 'Failed to approve registration');
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
      setError(''); setSuccessMessage('');
      const response = await fetch(API_URL + '/reject-player/' + id, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + auth.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'No reason provided' })
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(responseData.message || 'Failed to reject registration');
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
    navigate('/');
  }

  function handleTournamentAdded() {
    setTournamentRefresh(prev => prev + 1);
  }

  const navItems = [
    { id: 'tournaments', label: 'Events', icon: <Trophy size={16} /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={16} /> },
    { id: 'bracket', label: 'Arena', icon: <Layout size={16} /> },
    { id: 'live-scoring', label: 'Live SC', icon: <Activity size={16} /> },
    { id: 'practice', label: 'Practice', icon: <History size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck size={16} /> },
    { id: 'inventory', label: 'Inventory', icon: <Package size={16} /> },
    { id: 'approvals', label: 'Queue', icon: <CheckCircle size={16} /> },
    { id: 'players', label: 'Athletes', icon: <Users size={16} /> },
    { id: 'status', label: 'Settings', icon: <Settings size={16} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={16} /> },
  ];

  return (
    <div className="admin-dashboard-container">
      {/* ── Top Navbar ── */}
      <InnerNavbar
        title="Admin Panel"
        username={username}
        backTo="/"
        onLogout={handleLogout}
      />

      {/* ── Secondary Navigation Bar ── */}
      <div className="admin-subnav">
        <div className="admin-subnav__inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`admin-subnav__item ${activeTab === item.id ? 'admin-subnav__item--active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'players') loadPlayers();
              }}
            >
              <span className="admin-subnav__icon">{item.icon}</span>
              <span className="admin-subnav__label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Page Content ── */ }
      <div className="admin-page-content">
        {activeTab === 'tournaments' && <TournamentManagement token={auth.token} onTournamentAdded={handleTournamentAdded} key="tab-tournaments" />}
        {activeTab === 'calendar' && <TournamentCalendar token={auth.token} refreshTrigger={tournamentRefresh} key="tab-calendar" />}
        {activeTab === 'bracket' && <TournamentBracket token={auth.token} key="tab-bracket" onOpenLiveScoring={() => setActiveTab('live-scoring')} />}
        {activeTab === 'live-scoring' && <LiveScoring key="tab-live-scoring" />}
        {activeTab === 'inventory' && <InventoryPage isAdmin={true} userId={auth.user?.id} key="tab-inventory" />}
        {activeTab === 'practice' && <PracticeSessionManagement token={auth.token} key="tab-practice" />}
        {activeTab === 'attendance' && <AdminAttendanceManagement token={auth.token} key="tab-attendance" />}
        {activeTab === 'reports' && <AttendanceReport key="tab-reports" />}
        {activeTab === 'status' && <SystemStatus key="tab-status" />}

        {activeTab === 'players' && (
          <div className="admin-card" key="tab-players">
            <h2 className="admin-card__title">Athlete Administration</h2>
            {playersError && <div className="error-message">{playersError}</div>}
            {playersSuccess && <div className="success-message">{playersSuccess}</div>}
            
            {playersLoading ? (
              <div className="loading">Retrieving athletes...</div>
            ) : (
              <div className="players-management-grid">
                <div className="requests-table scrollable" style={{ border: '1px solid #eef2f6' }}>
                  <table style={{ minWidth: '800px' }}>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email Address</th>
                        <th>Identity No.</th>
                        <th>Account Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(players || []).map((player) => (
                        <tr
                          key={player.id}
                          onClick={() => openPlayerDetails(player.id)}
                          className={selectedPlayerId === player.id ? 'selected-row' : ''}
                        >
                          <td style={{ fontWeight: '800', color: '#000040' }}>{player.username}</td>
                          <td>{player.email}</td>
                          <td><code>{player.identityNumber}</code></td>
                          <td>
                            <span className={`status-badge ${player.isApproved ? 'status-completed' : 'status-scheduled'}`}>
                              {player.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="player-details-card" style={{ border: '1px solid #eef2f6', borderRadius: '20px', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,64,0.02)' }}>
                  {!selectedPlayer ? (
                    <div className="no-data" style={{ background: 'transparent', border: 'none', padding: '40px' }}>
                      Select an athlete from the list to view and manage their full profile details.
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: '#000040' }}>Athlete Profile: {selectedPlayer.username}</h3>
                      <div className="player-form-grid">
                        <div className="form-group-item">
                          <label>Full Username</label>
                          <input name="username" value={playerForm.username} onChange={handlePlayerFormChange} />
                        </div>
                        <div className="form-group-item">
                          <label>Email Address</label>
                          <input name="email" value={playerForm.email} onChange={handlePlayerFormChange} />
                        </div>
                        <div className="form-group-item">
                          <label>Identity Number</label>
                          <input name="identityNumber" value={playerForm.identityNumber} onChange={handlePlayerFormChange} />
                        </div>
                        <div className="form-group-item">
                          <label>Contact Number</label>
                          <input name="contactNumber" value={playerForm.contactNumber} onChange={handlePlayerFormChange} />
                        </div>
                        <div className="form-group-item">
                          <label>Residential Address</label>
                          <textarea name="address" value={playerForm.address} onChange={handlePlayerFormChange} rows={3} />
                        </div>
                        <div className="form-group-item">
                          <label>System Role</label>
                          <select name="role" value={playerForm.role} onChange={handlePlayerFormChange}>
                            <option value={1}>System Admin</option>
                            <option value={2}>Admin</option>
                            <option value={3}>Player</option>
                            <option value={4}>Pending Player</option>
                          </select>
                        </div>
                        <div className="form-group-item">
                          <label>Reset Password</label>
                          <input type="password" name="newPassword" value={playerForm.newPassword} onChange={handlePlayerFormChange} placeholder="Leave blank to keep current" />
                        </div>
                        <div className="checkbox-row" style={{ margin: '12px 0' }}>
                          <input type="checkbox" name="isApproved" checked={playerForm.isApproved} onChange={handlePlayerFormChange} style={{ transform: 'scale(1.2)' }} />
                          <span style={{ fontWeight: 700, fontSize: '14px', color: '#000040' }}>Approved Account</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                          <div className="readonly-meta"><strong>Joined: </strong>{selectedPlayer.createdAt ? new Date(selectedPlayer.createdAt).toLocaleDateString() : '-'}</div>
                          <div className="readonly-meta"><strong>Approved: </strong>{selectedPlayer.approvedAt ? new Date(selectedPlayer.approvedAt).toLocaleDateString() : '-'}</div>
                        </div>
                        
                        <button className="btn-primary" onClick={savePlayerChanges} disabled={savingPlayer} style={{ width: '100%', padding: '12px' }}>
                          {savingPlayer ? 'Synchronizing Profile...' : 'Commit Profile Changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="admin-card" key="tab-approvals">
            <h2 className="admin-card__title">Registration Queue</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {loading ? (
              <div className="loading">Processing queue...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="no-data">No new registration requests in the queue.</div>
            ) : (
              <div className="requests-table scrollable" style={{ border: '1px solid #eef2f6', borderRadius: '20px' }}>
                <table style={{ minWidth: '950px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '200px' }}>Applicant</th>
                      <th style={{ width: '180px' }}>Identity No.</th>
                      <th style={{ width: '250px' }}>Email Address</th>
                      <th style={{ width: '150px' }}>Applied On</th>
                      <th style={{ textAlign: 'center' }}>Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: '800', color: '#000040' }}>{req.username}</td>
                        <td><code>{req.identityNumber}</code></td>
                        <td>{req.email}</td>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="actions-cell" style={{ justifyContent: 'center' }}>
                            <button className="btn-primary" style={{ padding: '6px 20px', borderRadius: '50px' }} onClick={() => approve(req.id, req.username)}>Approve</button>
                            <button className="btn-danger" style={{ padding: '6px 20px', borderRadius: '50px' }} onClick={() => reject(req.id, req.username)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}