import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import '../styles/PlayerAttendance.css';

export default function PlayerAttendance() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadMyAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMyAttendance() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/practicesessions/my-attendance`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load attendance');
      }

      setRows(data.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load attendance');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="player-attendance-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1>My Attendance</h1>
          <div className="nav-right">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>
      </nav>

      <div className="attendance-content">
        {error ? <div className="error-message">{error}</div> : null}

        {loading ? (
          <div className="loading">Loading attendance...</div>
        ) : (
          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Marked By</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.attendanceDate}-${row.session?.sessionId || index}`}>
                    <td>{new Date(row.attendanceDate).toLocaleDateString()}</td>
                    <td>{row.session?.sessionType || '-'}</td>
                    <td>{row.session ? `${row.session.startTime} - ${row.session.endTime}` : '-'}</td>
                    <td>
                      <span className={row.isPresent ? 'status-present' : 'status-absent'}>
                        {row.isPresent ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td>{row.markedByAdmin || '-'}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No attendance has been marked for you yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
