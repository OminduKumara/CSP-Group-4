import { API_ENDPOINTS } from '../config/api';

// Pointing to your new PlayerController
const API_URL = `${API_ENDPOINTS.AUTH.replace('/auth', '')}/player`; 

export const playerService = {
  getDashboardStats: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch player stats');
    }

    return await response.json();
  }
}