import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/apiConfig';

console.log('🌐 API URL:', API_CONFIG.BASE_URL);

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token retrieval error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
  
// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verify: (data) => api.post('/auth/verify', data),
  resendCode: (data) => api.post('/auth/resend-code', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const courseAPI = {
  getAll: () => api.get('/courses'),
};

export const pretestAPI = {
  start: () => api.post('/pretest/start'),
  answer: (data) => api.post('/pretest/answer', data),
  checkStatus: () => api.get('/pretest/status'),
};

export const applicationAPI = {
  submit: (data) => api.post('/application', data),
  getMine: () => api.get('/application/me'),
  update: (id, data) => api.put(`/application/${id}`, data),
};

export const trackingAPI = {
  lookup: (code) => api.get(`/tracking/${code}`),
};

export const feedAPI = {
  getPosts: () => api.get('/feed'),
  createPost: (content) => api.post('/feed', { content }),
  addComment: (postId, content) => api.post(`/feed/${postId}/comments`, { content }),
  getMyPosts: () => api.get('/feed/my-posts'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (currentPassword, newPassword) => 
    api.put('/profile/change-password', { currentPassword, newPassword }),
};

export default api;
