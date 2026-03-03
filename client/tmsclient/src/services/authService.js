import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.AUTH;

export const authService = {
  login: async (identifier, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: identifier.trim(), password }),
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        errorMessage = error.message || 'Login failed';
      } catch {
        errorMessage = `Login failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username || identifier);
      localStorage.setItem('role', data.role || '');
    }
    return data;
  },

  signup: async (username, identityNumber, email, password, confirmPassword) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        identityNumber,
        email,
        password,
        confirmPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUsername: () => {
    return localStorage.getItem('username');
  },
};
