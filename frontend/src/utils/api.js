import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hm_token');
      localStorage.removeItem('hm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadResume: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/profile/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  addProject: (data) => api.post('/profile/projects', data),
  updateProject: (id, data) => api.put(`/profile/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/profile/projects/${id}`),
  getPublic: (username) => api.get(`/profile/${username}`),
  sendOutreach: (id) => api.post(`/profile/${id}/outreach`),
};

export const usersAPI = {
  discover: (params) => api.get('/users', { params }),
  suggested: () => api.get('/users/suggested'),
};

export const matchAPI = {
  run: (teamSize = 4) => api.post('/match', { teamSize }),
  history: () => api.get('/match/history'),
  accept: (teamId) => api.post('/match/accept', { teamId }),
  reject: (teamId) => api.post('/match/reject', { teamId }),
  rebalance: (teamId, memberIds) => api.post('/match/rebalance', { teamId, memberIds }),
};

export const chatAPI = {
  send: (message) => api.post('/chat', { message }),
  clearHistory: () => api.delete('/chat/history'),
};

export const notificationsAPI = {
  get: () => api.get('/notifications'),
  readAll: () => api.put('/notifications/read-all'),
  readOne: (id) => api.put(`/notifications/${id}/read`),
  clearAll: () => api.delete('/notifications/all'),
};

export default api;
