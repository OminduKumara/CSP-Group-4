import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.ADMIN;

export const adminService = {
  getPendingRegistrations: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pending-registrations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch pending registrations');
    }

    return await response.json();
  },

  approveRegistration: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/approve-registration/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve registration');
    }

    return await response.json();
  },

  rejectRegistration: async (userId, reason = '') => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/reject-registration/${userId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject registration');
    }

    return await response.json();
  },

  getAttendanceReport: async (startDate, endDate) => {
    const token = localStorage.getItem('token');
    
    // URLSearchParams cleanly formats the dates for the query string
    const queryParams = new URLSearchParams({
      startDate: startDate,
      endDate: endDate
    });

    const response = await fetch(`${API_URL}/reports/attendance?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch attendance report');
    }

    return await response.json();
  },
};
