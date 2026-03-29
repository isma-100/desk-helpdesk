import axios from 'axios';
import toast from 'react-hot-toast';

// In production: REACT_APP_API_URL=https://your-backend.railway.app/api
// In development: uses CRA proxy (http://localhost:5000)
const baseURL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hd_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      const isLoginRoute = error.config?.url?.includes('/auth/login');
      if (!isLoginRoute) {
        localStorage.removeItem('hd_token');
        localStorage.removeItem('hd_user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    }
    return Promise.reject({ ...error, message: msg });
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:           (data) => api.post('/auth/login', data),
  register:        (data) => api.post('/auth/register', data),
  getMe:           ()     => api.get('/auth/me'),
  updateProfile:   (data) => api.put('/auth/profile', data),
  changePassword:  (data) => api.put('/auth/change-password', data),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
  resetPassword:   (data) => api.post('/auth/reset-password', data),
};

// ─── Tickets ───────────────────────────────────────────────────────────────────
export const ticketAPI = {
  getAll:   (params)   => api.get('/tickets', { params }),
  getOne:   (id)       => api.get(`/tickets/${id}`),
  create:   (formData) => api.post('/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:   (id, data) => api.put(`/tickets/${id}`, data),
  delete:   (id)       => api.delete(`/tickets/${id}`),
  getStats: ()         => api.get('/tickets/stats'),
};

// ─── Comments ──────────────────────────────────────────────────────────────────
export const commentAPI = {
  getAll: (ticketId)       => api.get(`/comments/${ticketId}`),
  create: (ticketId, data) => api.post(`/comments/${ticketId}`, data),
  delete: (id)             => api.delete(`/comments/${id}`),
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll:         (params)   => api.get('/users', { params }),
  getTechnicians: ()         => api.get('/users/technicians'),
  create:         (data)     => api.post('/users', data),
  update:         (id, data) => api.put(`/users/${id}`, data),
  toggle:         (id)       => api.patch(`/users/${id}/toggle`),
};

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:   (params) => api.get('/notifications', { params }),
  markRead: (ids)    => api.put('/notifications/read', { ids }),
};

// ─── Audit Logs ────────────────────────────────────────────────────────────────
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
};

// ─── File Upload ───────────────────────────────────────────────────────────────
export const uploadAPI = {
  upload: (formData) => api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default api;
