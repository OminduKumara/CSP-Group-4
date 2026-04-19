
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  ADMIN: `${API_BASE_URL}/admin`,
};

export default API_BASE_URL;
