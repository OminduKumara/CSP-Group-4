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
      <h2>Attendance Management</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <select
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
        >
          <option value="">Select Practice Session</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.dayOfWeek} | {session.startTime} - {session.endTime} | {session.sessionType}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
        />

        <button className="approve-btn" onClick={() => loadAttendanceGrid()}>
          Load Attendance
        </button>
      </div>

      {selectedSession ? (
        <p style={{ marginTop: 0, color: '#4b5563' }}>
          Editing session: <strong>{selectedSession.dayOfWeek}</strong> ({selectedSession.startTime} - {selectedSession.endTime}) - {selectedSession.sessionType}
        </p>
      ) : null}

      {loading ? (
        <div className="loading">Loading attendance...</div>
      ) : attendanceRows.length > 0 ? (
        <div className="requests-table" style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Email</th>
                <th>Identity Number</th>
                <th>Present</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row) => (
                <tr key={row.playerId}>
                  <td>{row.playerName}</td>
                  <td>{row.playerEmail}</td>
                  <td>{row.playerIdentityNumber}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!row.isPresent}
                      onChange={() => toggleAttendance(row.playerId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-requests">
          <p>Select a session/date and click "Load Attendance".</p>
        </div>
      )}

      <div style={{ marginBottom: '28px' }}>
        <button className="approve-btn" onClick={handleSaveAttendance} disabled={saving || attendanceRows.length === 0}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      <h2>Admin Report - Frequent Absentees</h2>
      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Email</th>
              <th>Missed Sessions</th>
              <th>Total Marked Sessions</th>
              <th>Miss %</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row) => (
              <tr key={row.playerId}>
                <td>{row.username}</td>
                <td>{row.email}</td>
                <td>{row.missedSessions}</td>
                <td>{row.totalMarkedSessions}</td>
                <td>{row.missPercentage}%</td>
              </tr>
            ))}
            {reportRows.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No absentee data yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
