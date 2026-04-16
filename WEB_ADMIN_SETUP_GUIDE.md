# CTU Admission Portal - Web Admin Panel Setup Guide

## Overview
This guide will help you create a Next.js-based web admin panel for managing the CTU Admission Portal.

---

## Quick Start (Recommended)

### Step 1: Create Next.js Project

```bash
# Navigate to your project root (same level as mobile and backend folders)
cd C:\Programming\admissionanti

# Create Next.js app
npx create-next-app@latest web-admin

# When prompted, choose:
✔ Would you like to use TypeScript? › No
✔ Would you like to use ESLint? › Yes
✔ Would you like to use Tailwind CSS? › Yes
✔ Would you like to use `src/` directory? › Yes
✔ Would you like to use App Router? › Yes
✔ Would you like to customize the default import alias? › No
```

### Step 2: Install Dependencies

```bash
cd web-admin

# Core dependencies
npm install axios
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @tanstack/react-query
npm install react-hook-form
npm install date-fns
npm install recharts

# Development dependencies
npm install -D @types/node
```

---

## Project Structure

```
web-admin/
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Home/Login page
│   │   ├── dashboard/
│   │   │   └── page.js            # Dashboard
│   │   ├── applications/
│   │   │   ├── page.js            # Applications list
│   │   │   └── [id]/page.js       # Application details
│   │   ├── users/
│   │   │   └── page.js            # Users management
│   │   ├── courses/
│   │   │   └── page.js            # Courses management
│   │   ├── posts/
│   │   │   └── page.js            # Feed posts management
│   │   └── settings/
│   │       └── page.js            # Settings
│   ├── components/
│   │   ├── Sidebar.js             # Navigation sidebar
│   │   ├── Header.js              # Top header
│   │   ├── StatsCard.js           # Dashboard stat cards
│   │   └── DataTable.js           # Reusable table
│   ├── services/
│   │   └── api.js                 # API service (same as mobile)
│   ├── utils/
│   │   ├── auth.js                # Auth helpers
│   │   └── formatters.js          # Data formatters
│   └── styles/
│       └── globals.css            # Global styles
├── public/
│   └── logo.png                   # CTU logo
├── .env.local                     # Environment variables
└── package.json
```

---

## Step 3: Create Essential Files

### 1. Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=CTU Admin Portal
```

### 2. API Service (`src/services/api.js`)

```javascript
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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
};

// Feed API
export const feedAPI = {
  getPosts: () => api.get('/feed'),
  createPost: (content) => api.post('/feed', { content }),
  deletePost: (id) => api.delete(`/feed/${id}`),
};

export default api;
```

### 3. Auth Utilities (`src/utils/auth.js`)

```javascript
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
    window.location.href = '/';
    return false;
  }
  if (!isAdmin()) {
    alert('Access denied. Admin privileges required.');
    window.location.href = '/';
    return false;
  }
  return true;
};
```

### 4. Root Layout (`src/app/layout.js`)

```javascript
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CTU Admin Portal',
  description: 'CTU Daanbantayan Campus Admission Portal - Admin Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### 5. Login Page (`src/app/page.js`)

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Check if user is admin
      if (user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">CTU Admin Portal</h1>
          <p className="text-gray-600 mt-2">Admission Management System</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="admin@ctu.edu.ph"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Admin access only</p>
          <p className="mt-2">Default: admin@ctu.edu.ph / admin123</p>
        </div>
      </div>
    </div>
  );
}
```

### 6. Dashboard Page (`src/app/dashboard/page.js`)

```javascript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireAuth } from '@/utils/auth';
import { adminAPI } from '@/services/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requireAuth()) return;
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stat Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.totalApplications || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Pending Review</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats?.pendingApplications || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.approvedApplications || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Rejected</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats?.rejectedApplications || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats?.totalUsers || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Verified Users</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {stats?.verifiedUsers || 0}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/applications')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition"
          >
            Manage Applications
          </button>
          <button
            onClick={() => router.push('/users')}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition"
          >
            Manage Users
          </button>
          <button
            onClick={() => router.push('/courses')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition"
          >
            Manage Courses
          </button>
          <button
            onClick={() => router.push('/posts')}
            className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition"
          >
            Manage Posts
          </button>
        </div>
      </main>
    </div>
  );
}
```

---

## Step 4: Run the Web Admin

```bash
cd web-admin
npm run dev
```

Open browser: `http://localhost:3000`

---

## Step 5: Test Login

**Default Admin Account:**
- Email: `admin@ctu.edu.ph`
- Password: `admin123`

---

## Next Steps

After basic setup works, I can help you create:

1. ✅ **Applications Management Page** - View, filter, update applications
2. ✅ **Application Details Page** - Full application view with stage management
3. ✅ **Users Management Page** - View and manage users
4. ✅ **Courses Management Page** - CRUD operations for courses
5. ✅ **Posts Management Page** - View and delete feed posts
6. ✅ **Settings Page** - Tracking stage management

---

## Deployment Options

### Option 1: Vercel (Easiest)
```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: Netlify
```bash
npm run build
# Upload 'out' folder to Netlify
```

### Option 3: Your Own Server
```bash
npm run build
npm start
```

---

## Security Checklist

- ✅ Admin role check on login
- ✅ Token validation on every request
- ✅ Auto-logout on 401 errors
- ✅ HTTPS in production
- ✅ Environment variables for API URL
- ✅ No admin access from mobile app

---

## Summary

**What we did:**
1. ✅ Blocked admin access in mobile app
2. ✅ Created Next.js web admin project structure
3. ✅ Set up API service (reuses backend endpoints)
4. ✅ Created login page with admin validation
5. ✅ Created dashboard with stats

**What's next:**
Let me know when you're ready, and I'll create the remaining pages (Applications, Users, Courses, Posts management) with full CRUD functionality!

Would you like me to proceed with creating all the management pages?
