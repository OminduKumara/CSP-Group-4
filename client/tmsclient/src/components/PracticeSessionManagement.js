import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
export default function PracticeSessionManagement({ token }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 'Wednesday',
    startTime: '',
    endTime: '',
    sessionType: 'Team Practice'
  });

  const API_URL = `${API_BASE_URL}/practicesessions`;

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Database blocked or unavailable");
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.warn("Using fallback data for admin dashboard", err);
      setSessions([
        { id: 1, dayOfWeek: 'Wednesday', startTime: '3:00 PM', endTime: '6:30 PM', sessionType: 'Team Practice (Fallback)' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setFormData({
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      sessionType: session.sessionType
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ dayOfWeek: 'Wednesday', startTime: '', endTime: '', sessionType: 'Team Practice' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to save session");

      setSuccess(editingId ? "Session updated!" : "Session added!");
      cancelEdit();
      fetchSessions(); 
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Cannot save to database while Azure Firewall is blocking connection.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this practice session?")) return;

    try {
      setError('');
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete");
      
      setSuccess("Session deleted!");
      fetchSessions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Cannot delete from database while Azure Firewall is blocking connection.");
    }
  }; 

  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

  const handleRowClick = (session, e) => {
    // Prevent modal if clicking action buttons or internal inputs
    if (e.target.closest('.actions-cell') || e.target.closest('input') || e.target.closest('select')) return;
    setSelectedSessionDetail(session);
  };

  return (
    <div className="approvals-tab">
      <h2>Manage Practice Sessions</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Input Form */}
      <div className="admin-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.2rem' }}>{editingId ? 'Modify Session Details' : 'Create New Practice Session'}</h3>
        <form onSubmit={handleSubmit} className="practice-form-grid">
          
          <div className="form-group-item">
            <label>Day of Week</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleInputChange}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="form-group-item">
            <label>Start Time</label>
            <input type="text" name="startTime" value={formData.startTime} onChange={handleInputChange} placeholder="e.g. 3:00 PM" required />
          </div>

          <div className="form-group-item">
            <label>End Time</label>
            <input type="text" name="endTime" value={formData.endTime} onChange={handleInputChange} placeholder="e.g. 6:30 PM" required />
          </div>

          <div className="form-group-item">
            <label>Session Category</label>
            <input type="text" name="sessionType" value={formData.sessionType} onChange={handleInputChange} placeholder="e.g. Team Practice" required />
          </div>

          <div className="form-actions-practice">
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
              {editingId ? 'Update' : 'Add Session'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ background: '#64748b', padding: '10px 24px' }} 
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="loading">Synchronizing Sessions...</div>
      ) : (
        <div className="requests-table scrollable">
          <table>
            <thead>
              <tr>
                <th>Practice Day</th>
                <th>Time Window</th>
                <th>Session Profile</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr 
                  key={session.id} 
                  onClick={(e) => handleRowClick(session, e)}
                  style={{ cursor: 'pointer' }}
                  className="interactive-row"
                >
                  <td><strong>{session.dayOfWeek}</strong></td>
                  <td>{session.startTime} — {session.endTime}</td>
                  <td>
                    <span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}>
                      {session.sessionType}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-secondary btn-sm" 
                        style={{ height: '32px' }}
                        onClick={() => handleEdit(session)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger btn-sm" 
                        style={{ height: '32px' }}
                        onClick={() => handleDelete(session.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', opacity: 0.5 }}>No scheduled practice sessions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSessionDetail && (
        <div className="event-details-overlay" onClick={() => setSelectedSessionDetail(null)}>
          <div className="event-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedSessionDetail(null)}>×</button>
            <div className="event-details-header">
              <h3>Practice Session Details</h3>
              <span className="status-badge" style={{ background: '#8b5cf6', color: 'white' }}>ACTIVE</span>
            </div>
            
            <div className="event-detail-item" style={{ marginTop: '24px' }}>
              <strong>Session Category:</strong>
              <p>{selectedSessionDetail.sessionType}</p>
            </div>

            <div className="event-detail-item">
              <strong>Scheduled Day:</strong>
              <p>{selectedSessionDetail.dayOfWeek}</p>
            </div>

            <div className="event-detail-item">
              <strong>Time Window:</strong>
              <p>{selectedSessionDetail.startTime} to {selectedSessionDetail.endTime}</p>
            </div>

            <div className="event-detail-item">
              <strong>Location:</strong>
              <p>SLIIT Tennis Courts</p>
            </div>

            <button className="btn-close" style={{ width: '100%' }} onClick={() => setSelectedSessionDetail(null)}>
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}