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
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};

export const profileAPI = {
  get: () => api.get('/api/profile'),
  update: (data) => api.put('/api/profile', data),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/api/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadResume: (file) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post('/api/profile/resume', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  addProject: (data) => api.post('/api/profile/projects', data),
  updateProject: (id, data) => api.put(`/api/profile/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/profile/projects/${id}`),
  getPublic: (username) => api.get(`/api/profile/${username}`),
  sendOutreach: (id) => api.post(`/api/profile/${id}/outreach`),
};

export const usersAPI = {
  discover: (params) => api.get('/api/users', { params }),
  suggested: () => api.get('/api/users/suggested'),
};

export const matchAPI = {
  run: (teamSize = 4) => api.post('/api/match', { teamSize }),
  history: () => api.get('/api/match/history'),
  accept: (teamId) => api.post('/api/match/accept', { teamId }),
  reject: (teamId) => api.post('/api/match/reject', { teamId }),
  rebalance: (teamId, memberIds) => api.post('/api/match/rebalance', { teamId, memberIds }),
  respondInvite: (data) => api.post('/api/match/respond-invite', data),
};

export const chatAPI = {
  send: (message) => api.post('/api/chat', { message }),
  clearHistory: () => api.delete('/api/chat/history'),
};

export const notificationsAPI = {
  get: () => api.get('/api/notifications'),
  readAll: () => api.put('/api/notifications/read-all'),
  readOne: (id) => api.put(`/api/notifications/${id}/read`),
  clearAll: () => api.delete('/api/notifications/all'),
};

export const teamChatAPI = {
  getHistory: (teamId) => api.get(`/api/team-chat/history/${teamId}`),
  send: (teamId, text) => api.post('/api/team-chat/send', { teamId, text }),
};

export default api;
