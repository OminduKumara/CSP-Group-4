import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.ADMIN.replace('/admin', '/tournaments');

export const tournamentService = {
  async getAllTournaments() {
    const response = await fetch(API_URL, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch tournaments');
    const data = await response.json();
    return data.data || [];
  },

  async getTournamentById(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to fetch tournament');
    const data = await response.json();
    return data.data;
  },

  async getTournamentsByStatus(status) {
    const response = await fetch(`${API_URL}/status/${status}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Failed to fetch ${status} tournaments`);
    const data = await response.json();
    return data.data || [];
  },

  async createTournament(tournament, token) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tournament)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create tournament');
    }
    const data = await response.json();
    return data.data;
  },

  async updateTournament(id, tournament, token) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tournament)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update tournament');
    }
    const data = await response.json();
    return data.data;
  },

  async updateTournamentStatus(id, status, token) {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ Status: status })
    });
    if (!response.ok) {
      let errorMessage = 'Failed to update tournament status';
      try {
        const error = await response.json();
        errorMessage = error.message || errorMessage;
      } catch {
        errorMessage = `${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.data;
  },

  async deleteTournament(id, token) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete tournament');
    }
    return true;
  }
};
