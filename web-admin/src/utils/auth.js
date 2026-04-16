import { showToast } from './toast';

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

export const requireAuth = () => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return false;
  }
  if (!isAdmin()) {
    if (typeof window !== 'undefined') {
      showToast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
    }
    return false;
  }
  return true;
};
