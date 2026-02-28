const API_URL = 'http://localhost:5011/api/auth';

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
};
