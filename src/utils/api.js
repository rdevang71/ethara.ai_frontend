import axios from 'axios';

// Prefer VITE_API_URL (full backend base), fall back to VITE_API_BASE (legacy).
const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;
let base;
if (envUrl) {
  const trimmed = envUrl.replace(/\/$/, '');
  base = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
} else {
  base = '/api';
}

const api = axios.create({ baseURL: base });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pf_token');
      localStorage.removeItem('pf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
