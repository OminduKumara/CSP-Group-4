import axios from 'axios';
import API_BASE_URL from '../config/api';

const groupService = {
  // Get all groups with players for a tournament
  getGroupsByTournament: async (tournamentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/group/tournament/${tournamentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  },

  // Get a specific group with players
  getGroup: async (groupId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/group/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  },

  // Create groups with random assignment
  createGroupsWithRandomAssignment: async (tournamentId, numberOfGroups, playerIds, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/group/random-assign`,
        {
          tournamentId,
          numberOfGroups,
          playerIds
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating groups with random assignment:', error);
      throw error;
    }
  },

  // Create a single group manually
  createGroup: async (groupData, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/group`,
        groupData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Update a group
  updateGroup: async (groupId, groupData, token) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/group/${groupId}`,
        groupData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  },

  // Assign a player to a group
  assignPlayerToGroup: async (groupId, playerId, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/group/${groupId}/player/${playerId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning player to group:', error);
      throw error;
    }
  },

  // Remove a player from a group
  removePlayerFromGroup: async (groupId, playerId, token) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/group/${groupId}/player/${playerId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing player from group:', error);
      throw error;
    }
  },

  // Delete a group
  deleteGroup: async (groupId, token) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/group/${groupId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  },

  // Reassign all groups for a tournament randomly
  reassignGroups: async (tournamentId, numberOfGroups, playerIds, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/group/tournament/${tournamentId}/reassign`,
        {
          tournamentId,
          numberOfGroups,
          playerIds
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error reassigning groups:', error);
      throw error;
    }
  }
};

export default groupService;
