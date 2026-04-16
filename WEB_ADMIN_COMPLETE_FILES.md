# Complete Web Admin Files

## All files have been created in the `web-admin` folder. Here are the remaining files you need to create:

---

## 1. Root Layout (`src/app/layout.js`)

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

---

## 2. Login Page (`src/app/page.js`)

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';
import { isAuthenticated } from '@/utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
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
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎓</div>
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Admin access only</p>
          <p className="mt-2 text-xs">Default: admin@ctu.edu.ph / admin123</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Shared Layout Component (`src/components/AdminLayout.js`)

```javascript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { authAPI, getUser } from '@/utils/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = getUser();

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
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">CTU Admin Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-semibold">{user?.fullName || 'Admin'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 flex items-center space-x-3 transition ${
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Installation & Setup Instructions

### Step 1: Create the Next.js project

```bash
cd C:\Programming\admissionanti
npx create-next-app@latest web-admin
```

When prompted:
- TypeScript? **No**
- ESLint? **Yes**
- Tailwind CSS? **Yes**
- `src/` directory? **Yes**
- App Router? **Yes**
- Import alias? **No**

### Step 2: Install dependencies

```bash
cd web-admin
npm install axios date-fns
```

### Step 3: Copy all files

Copy all the files I've created in the `web-admin` folder to your actual Next.js project.

### Step 4: Create remaining page files

I'll create these in separate messages due to length:
- Dashboard page
- Applications page
- Application details page
- Users page
- Courses page
- Posts page
- Settings page

### Step 5: Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Next Message

In the next message, I'll provide all the page components. Ready?
