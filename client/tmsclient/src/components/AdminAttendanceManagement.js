import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AdminAttendanceManagement({ token }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [reportRows, setReportRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSessions();
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === String(selectedSessionId)),
    [sessions, selectedSessionId]
  );

  async function loadSessions() {
    try {
      const response = await fetch(`${API_BASE_URL}/practicesessions`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error('Failed to load practice sessions');
      }
      setSessions(data || []);
      if ((data || []).length > 0) {
        setSelectedSessionId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message || 'Unable to load practice sessions');
    }
  }

  async function loadAttendanceGrid(sessionIdArg, dateArg) {
    const sessionId = sessionIdArg || selectedSessionId;
    const attendanceDate = dateArg || selectedDate;
    if (!sessionId || !attendanceDate) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await fetch(
        `${API_BASE_URL}/practicesessions/${sessionId}/attendance?attendanceDate=${encodeURIComponent(attendanceDate)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load attendance grid');
      }
      setAttendanceRows((payload.players || []).map((row) => ({ ...row, changed: false })));
    } catch (err) {
      setError(err.message || 'Unable to load attendance records');
    } finally {
      setLoading(false);
    }
  }

  async function loadReport() {
    try {
      const response = await fetch(`${API_BASE_URL}/practicesessions/attendance-report?minMissed=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load attendance report');
      }
      setReportRows(payload.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load attendance report');
    }
  }

  function toggleAttendance(playerId) {
    setAttendanceRows((prev) =>
      prev.map((row) =>
        row.playerId === playerId ? { ...row, isPresent: !row.isPresent, changed: true } : row
      )
    );
  }

  async function handleSaveAttendance() {
    if (!selectedSessionId) return;
    const confirmSave = window.confirm(
      'Confirm attendance save? This will overwrite attendance values for this session/date.'
    );
    if (!confirmSave) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const payload = {
        attendanceDate: selectedDate,
        confirmSave: true,
        items: attendanceRows.map((row) => ({
          playerId: row.playerId,
          isPresent: !!row.isPresent
        }))
      };

      const response = await fetch(`${API_BASE_URL}/practicesessions/${selectedSessionId}/attendance`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save attendance');
      }
      setSuccess(responseData.message || 'Attendance saved successfully');
      await loadAttendanceGrid(selectedSessionId, selectedDate);
      await loadReport();
    } catch (err) {
      setError(err.message || 'Unable to save attendance');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="approvals-tab">
      <h2>Attendance Central</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Session Selection</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group-item" style={{ flex: 1, minWidth: '300px' }}>
            <label>Practice Session</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              <option value="">Select Practice Session</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.dayOfWeek} | {session.startTime} - {session.endTime} | {session.sessionType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-item">
            <label>Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={() => loadAttendanceGrid()} style={{ height: '42px', padding: '0 30px' }}>
            Load Records
          </button>
        </div>

        {selectedSession ? (
          <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span className="status-badge status-inprogress" style={{ margin: 0 }}>Active</span>
             <span style={{ fontSize: '14px', fontWeight: 700, color: '#000040' }}>
               {selectedSession.dayOfWeek} ({selectedSession.startTime} - {selectedSession.endTime}) — {selectedSession.sessionType}
             </span>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="loading">Retrieving Attendance Data...</div>
      ) : attendanceRows.length > 0 ? (
        <div className="requests-table" style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Athlete Name</th>
                <th>Contact / Email</th>
                <th>Identity #</th>
                <th style={{ textAlign: 'center' }}>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row) => (
                <tr key={row.playerId}>
                  <td><strong>{row.playerName}</strong></td>
                  <td>{row.playerEmail}</td>
                  <td><code>{row.playerIdentityNumber}</code></td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={!!row.isPresent}
                      onChange={() => toggleAttendance(row.playerId)}
                      style={{ transform: 'scale(1.4)', cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>Please select a practice session and date above to load the attendance register.</p>
        </div>
      )}

      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn-primary" 
          onClick={handleSaveAttendance} 
          disabled={saving || attendanceRows.length === 0}
          style={{ padding: '12px 40px' }}
        >
          {saving ? 'Synchronizing...' : 'Commit Attendance Changes'}
        </button>
      </div>

      <h2 style={{ marginBottom: '20px' }}>Absence Analytics</h2>
      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>Athlete</th>
              <th>Contact</th>
              <th style={{ textAlign: 'center' }}>Missed</th>
              <th style={{ textAlign: 'center' }}>Total</th>
              <th style={{ textAlign: 'center' }}>Absence %</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row) => (
              <tr key={row.playerId}>
                <td><strong>{row.username}</strong></td>
                <td>{row.email}</td>
                <td style={{ textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>{row.missedSessions}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.totalMarkedSessions}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${row.missPercentage > 30 ? 'status-cancelled' : 'status-inprogress'}`}>
                    {row.missPercentage}%
                  </span>
                </td>
              </tr>
            ))}
            {reportRows.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', opacity: 0.5 }}>No attendance trends found for the current period.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
