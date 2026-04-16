# CTU Web Admin - Final Setup Guide

## ✅ Files Created

I've created the following files in the `web-admin` folder:

```
web-admin/
├── package.json                    ✅ Created
├── next.config.js                  ✅ Created
├── tailwind.config.js              ✅ Created
├── postcss.config.js               ✅ Created
├── .env.local                      ✅ Created
├── src/
│   ├── app/
│   │   ├── globals.css             ✅ Created
│   │   └── layout.js               ✅ Created
│   ├── services/
│   │   └── api.js                  ✅ Created
│   └── utils/
│       ├── auth.js                 ✅ Created
│       └── formatters.js           ✅ Created
```

---

## 🚀 Quick Installation

### Step 1: Navigate to project root

```bash
cd C:\Programming\admissionanti
```

### Step 2: The `web-admin` folder already has these files

All configuration files are ready. Now you just need to:

```bash
cd web-admin
npm install
```

### Step 3: Create the remaining page files

Create these files manually (I'll provide the code):

**Required Pages:**
1. `src/app/page.js` - Login page
2. `src/components/AdminLayout.js` - Shared layout
3. `src/app/dashboard/page.js` - Dashboard
4. `src/app/applications/page.js` - Applications list
5. `src/app/applications/[id]/page.js` - Application details
6. `src/app/users/page.js` - Users management
7. `src/app/courses/page.js` - Courses management
8. `src/app/posts/page.js` - Posts management
9. `src/app/settings/page.js` - Settings

---

## 📝 Complete Page Code

### 1. Login Page (`src/app/page.js`)

Create file: `web-admin/src/app/page.js`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      if (user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-gray-800">CTU Admin</h1>
          <p className="text-gray-600 mt-2">Admission Management</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="admin@ctu.edu.ph"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          Default: admin@ctu.edu.ph / admin123
        </p>
      </div>
    </div>
  );
}
```

---

### 2. Admin Layout Component (`src/components/AdminLayout.js`)

Create file: `web-admin/src/components/AdminLayout.js`

```javascript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authAPI } from '@/services/api';
import { requireAuth } from '@/utils/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!requireAuth()) return;
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Applications', path: '/applications', icon: '📝' },
    { name: 'Users', path: '/users', icon: '👥' },
    { name: 'Courses', path: '/courses', icon: '📚' },
    { name: 'Posts', path: '/posts', icon: '📰' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CTU Admin Portal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.fullName || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center space-x-3 ${
                  pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
```

---

## 🎯 Next Steps

1. **Install dependencies:**
   ```bash
   cd web-admin
   npm install
   ```

2. **Create the page files** listed above (I can provide each one)

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Access the admin panel:**
   Open `http://localhost:3000`

---

## 📦 What You Get

✅ **Complete Admin Panel** with:
- Login with admin validation
- Dashboard with statistics
- Applications management (view, update stages, approve/reject)
- Users management (view, search, delete)
- Courses management (CRUD operations)
- Posts management (view, delete)
- Settings (tracking stages configuration)

✅ **Modern UI** with:
- Tailwind CSS styling
- Responsive design
- Clean navigation
- Professional look

✅ **Security**:
- JWT authentication
- Admin role validation
- Auto-logout on token expiry
- Protected routes

---

## 🚀 Ready to Continue?

Would you like me to provide the code for all remaining pages now? I can create:

1. Dashboard page (with stats and charts)
2. Applications page (table with filters)
3. Application details page (full view with stage management)
4. Users page (table with search)
5. Courses page (CRUD interface)
6. Posts page (list with delete)
7. Settings page (tracking configuration)

Just say "yes" and I'll provide all the code!
