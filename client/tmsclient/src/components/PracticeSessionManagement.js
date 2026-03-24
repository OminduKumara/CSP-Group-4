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
  }; // <-- This bracket was missing!

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
  }; // <-- This bracket was missing too!

  return (
    <div className="approvals-tab">
      <h2>Manage Practice Sessions</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Input Form */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Session' : 'Add New Session'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6b7280' }}>Day</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleInputChange} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6b7280' }}>Start Time</label>
            <input type="text" name="startTime" value={formData.startTime} onChange={handleInputChange} placeholder="e.g. 3:00 PM" required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6b7280' }}>End Time</label>
            <input type="text" name="endTime" value={formData.endTime} onChange={handleInputChange} placeholder="e.g. 6:30 PM" required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#6b7280' }}>Session Type</label>
            <input type="text" name="sessionType" value={formData.sessionType} onChange={handleInputChange} placeholder="e.g. Team Practice" required style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="approve-btn">{editingId ? 'Update' : 'Add Session'}</button>
            {editingId && <button type="button" className="reject-btn" style={{ background: '#6b7280' }} onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="loading">Loading sessions...</div>
      ) : (
        <div className="requests-table">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Time Range</th>
                <th>Session Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
                  <td><strong>{session.dayOfWeek}</strong></td>
                  <td>{session.startTime} - {session.endTime}</td>
                  <td>{session.sessionType}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="approve-btn" style={{ background: '#3b82f6' }} onClick={() => handleEdit(session)}>Edit</button>
                      <button className="reject-btn" onClick={() => handleDelete(session.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No practice sessions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}