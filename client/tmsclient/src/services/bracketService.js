import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011/api';

const bracketService = {
  // ==================== TEAMS ====================
  
  /**
   * Get all teams for a tournament
   */
  getTeams: async (tournamentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/teams`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch teams');
    }
  },

  /**
   * Get specific team by ID
   */
  getTeamById: async (tournamentId, teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/teams/${teamId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch team');
    }
  },

  /**
   * Create new team
   */
  createTeam: async (tournamentId, teamData, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/teams`,
        teamData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create team');
    }
  },

  /**
   * Update team information
   */
  updateTeam: async (tournamentId, teamId, teamData, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/teams/${teamId}`,
        teamData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update team');
    }
  },

  /**
   * Delete team
   */
  deleteTeam: async (tournamentId, teamId, token) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/teams/${teamId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete team');
    }
  },

  // ==================== MATCHES ====================

  /**
   * Get all matches for tournament
   */
  getMatches: async (tournamentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch matches');
    }
  },

  /**
   * Get regular (non-playoff) matches
   */
  getRegularMatches: async (tournamentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/regular`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch regular matches');
    }
  },

  /**
   * Get playoff matches only
   */
  getPlayoffMatches: async (tournamentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/playoff`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch playoff matches');
    }
  },

  /**
   * Get specific match by ID
   */
  getMatchById: async (tournamentId, matchId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch match');
    }
  },

  /**
   * Create single match
   */
  createMatch: async (tournamentId, matchData, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches`,
        matchData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create match');
    }
  },

  /**
   * Create multiple matches at once (batch)
   */
  createMatchesBatch: async (tournamentId, matchesData, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/batch`,
        matchesData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create matches');
    }
  },

  /**
   * Update match result (set winner)
   */
  updateMatch: async (tournamentId, matchId, matchData, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}`,
        matchData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update match');
    }
  },

  /**
   * Delete specific match
   */
  deleteMatch: async (tournamentId, matchId, token) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete match');
    }
  },

  // ==================== BRACKET MANAGEMENT ====================

  /**
   * Delete entire bracket (teams and matches)
   */
  deleteBracket: async (tournamentId, token) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/tournaments/${tournamentId}/bracket`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete bracket');
    }
  },

  /**
   * Get calculated standings
   */
  getStandings: async (tournamentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/standings`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch standings');
    }
  }
    ,

    // ==================== LIVE SCORING ====================
    /**
     * Get all set scores for a match
     */
    getMatchScores: async (tournamentId, matchId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}/scores`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch match scores');
      }
    },

    /**
     * Update set score for a match (admin only)
     */
    updateMatchSetScore: async (tournamentId, matchId, setNumber, score, token) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}/scores/${setNumber}`,
          score,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update set score');
      }
    },

    /**
     * Delete set score for a match (admin only)
     */
    deleteMatchSetScore: async (tournamentId, matchId, setNumber, token) => {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}/scores/${setNumber}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete set score');
      }
    },

    /**
     * Get live game score for a match
     */
    getLiveGameScore: async (tournamentId, matchId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}/live`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch live game score');
      }
    },

    /**
     * Update live game score for a match (admin only)
     */
    updateLiveGameScore: async (tournamentId, matchId, score, token) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/tournaments/${tournamentId}/bracket/matches/${matchId}/live`,
          score,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update live game score');
      }
    }
};

export default bracketService;
