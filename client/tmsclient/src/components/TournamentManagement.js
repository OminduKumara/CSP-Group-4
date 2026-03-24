import React, { useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';
import '../styles/TournamentManagement.css';

export default function TournamentManagement({ token, onTournamentAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    try {
      setLoading(true);
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError('Name, start date, and end date are required');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await tournamentService.updateTournament(editingId, formData, token);
        setSuccessMessage('Tournament updated successfully');
        setEditingId(null);
      } else {
        await tournamentService.createTournament(formData, token);
        setSuccessMessage('Tournament created successfully');
      }
      
      resetForm();
      await loadTournaments();
      if (onTournamentAdded) onTournamentAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: ''
    });
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(tournament) {
    setFormData({
      name: tournament.name,
      description: tournament.description,
      startDate: tournament.startDate.split('T')[0],
      endDate: tournament.endDate.split('T')[0]
    });
    setEditingId(tournament.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    
    try {
      await tournamentService.deleteTournament(id, token);
      setSuccessMessage('Tournament deleted successfully');
      await loadTournaments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      if (!token) {
        setError('Authentication token not available. Please log in again.');
        return;
      }
      await tournamentService.updateTournamentStatus(id, newStatus, token);
      setSuccessMessage('Tournament status updated');
      await loadTournaments();
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.message);
    }
  }

  return (
    <div className="tournament-management">
      <div className="tournament-header">
        <h2>Tournament Management</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Tournament'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="tournament-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tournament Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Spring Championship 2026"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tournament description"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Tournament' : 'Create Tournament'}
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="tournaments-list">
        <h3>Tournaments ({tournaments.length})</h3>
        
        {loading && !tournaments.length ? (
          <div className="loading">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="no-data">No tournaments yet</div>
        ) : (
          <div className="tournaments-grid">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="tournament-card">
                <div className="tournament-card-header">
                  <h4>{tournament.name}</h4>
                  <span className={`status-badge status-${tournament.status.toLowerCase()}`}>
                    {tournament.status}
                  </span>
                </div>

                <div className="tournament-card-body">
                  {tournament.description && <p className="description">{tournament.description}</p>}
                  
                  <div className="dates">
                    <p><strong>Start:</strong> {new Date(tournament.startDate).toLocaleDateString()}</p>
                    <p><strong>End:</strong> {new Date(tournament.endDate).toLocaleDateString()}</p>
                  </div>

                  <div className="status-actions">
                    <select 
                      value={tournament.status}
                      onChange={(e) => handleStatusChange(tournament.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="tournament-card-footer">
                  <button 
                    className="btn-secondary btn-sm"
                    onClick={() => handleEdit(tournament)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger btn-sm"
                    onClick={() => handleDelete(tournament.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
