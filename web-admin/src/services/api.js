import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password, twoFactorCode = null) => api.post('/auth/login', { email, password, twoFactorCode }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getApplications: (filter) => api.get('/admin/applications', { params: { filter } }),
  getApplication: (id) => api.get(`/admin/applications/${id}`),
  updateApplication: (id, data) => api.put(`/admin/applications/${id}`, data),
  updateStage: (id, stage, data) => api.put(`/admin/applications/${id}/stages/${stage}`, data),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getTrackingStages: () => api.get('/admin/tracking/stages'),
  updateTrackingStages: (data) => api.put('/admin/tracking/stages', data),
  getNotifications: () => api.get('/admin/notifications'),
  getNotificationCount: () => api.get('/admin/notifications/count'),
  getPasswordHash: (twoFactorCode) => api.post('/admin/profile/hash', { twoFactorCode }),
  updateProfile: (data) => api.put('/admin/profile', data),
  // 2FA methods
  setup2FA: () => api.post('/admin/2fa/setup'),
  verify2FASetup: (token) => api.post('/admin/2fa/verify-setup', { token }),
  disable2FA: (password, token) => api.post('/admin/2fa/disable', { password, token }),
  get2FAStatus: () => api.get('/admin/2fa/status'),
};

// Feed API
export const feedAPI = {
  getPosts: () => api.get('/feed'),
  createPost: (data) => api.post('/feed', data),
  deletePost: (id) => api.delete(`/feed/${id}`),
};

// Notification API
export const notificationAPI = {
  sendBulk: (data) => api.post('/notifications/bulk', data),
};

export default api;
