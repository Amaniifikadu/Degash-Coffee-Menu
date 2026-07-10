import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the admin JWT (if present) to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cafe_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected, clear it so the app falls back to the login screen
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cafe_admin_token');
      localStorage.removeItem('cafe_admin_user');
    }
    return Promise.reject(error);
  }
);

export default api;