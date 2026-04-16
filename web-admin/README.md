# CTU Admission Portal - Web Admin Panel

## 🎓 Overview

This is the web-based admin panel for the CTU Daanbantayan Campus Admission Portal. Built with Next.js, it provides a comprehensive interface for managing applications, users, courses, and system settings.

## ✨ Features

### 📊 Dashboard
- Real-time statistics overview
- Quick access to all management sections
- Create pinned announcements for students
- Visual stats cards for applications and users

### 📝 Applications Management
- View all applications with filtering (All, Pending, Approved, Rejected)
- Search by tracking code or applicant name
- Detailed application view with full information
- Stage-by-stage progress management
- Approve/Reject applications
- Add notes and details to each stage

### 👥 Users Management
- View all registered users
- Search by name or email
- See verification status
- Delete non-admin users
- View user roles and join dates

### 📚 Courses Management
- Create, edit, and delete courses
- Course code and description management
- Grid view for easy browsing
- Used in student pretest and application

### 📰 Posts Management
- View all feed posts
- See pinned admin announcements
- Delete inappropriate content
- Search posts by content or author
- View comment counts

### ⚙️ Settings
- Configure tracking stages
- Enable/disable stages
- Add stage descriptions
- System information display

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:5000`
- Admin account credentials

### Installation

1. **Navigate to the web-admin folder:**
   ```bash
   cd web-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_NAME=CTU Admin Portal
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Default Login

- **Email:** admin@ctu.edu.ph
- **Password:** admin123

## 📁 Project Structure

```
web-admin/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.js              # Login page
│   │   ├── layout.js            # Root layout
│   │   ├── globals.css          # Global styles
│   │   ├── dashboard/           # Dashboard page
│   │   ├── applications/        # Applications management
│   │   │   ├── page.js         # Applications list
│   │   │   └── [id]/page.js    # Application details
│   │   ├── users/              # Users management
│   │   ├── courses/            # Courses management
│   │   ├── posts/              # Posts management
│   │   └── settings/           # Settings page
│   ├── components/
│   │   └── AdminLayout.js      # Shared admin layout
│   ├── services/
│   │   └── api.js              # API service layer
│   └── utils/
│       ├── auth.js             # Authentication utilities
│       └── formatters.js       # Data formatting utilities
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tailwind.config.js          # Tailwind CSS config
└── next.config.js              # Next.js config
```

## 🔐 Security Features

- **Admin-only access:** Only users with admin role can login
- **JWT authentication:** Secure token-based authentication
- **Auto-logout:** Automatic logout on token expiry
- **Protected routes:** All pages require authentication
- **Role validation:** Backend validates admin role on every request

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Date Formatting:** date-fns
- **State Management:** React Hooks
- **Routing:** Next.js App Router

## 📱 Mobile App Integration

The web admin panel shares the same backend API with the mobile app:

```
Mobile App (React Native)          Web Admin (Next.js)
        ↓                                   ↓
        └─────────→ Backend API ←──────────┘
                   (Express.js)
                        ↓
                   MongoDB
```

**Important:** Admin users cannot access the mobile app - they are automatically logged out and shown a message to use the web panel.

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🌐 Deployment

### Option 1: Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: Build and Deploy

```bash
npm run build
npm start
```

### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 API Endpoints Used

### Authentication
- `POST /api/auth/login` - Admin login

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/applications` - List applications
- `GET /api/admin/applications/:id` - Get application details
- `PUT /api/admin/applications/:id` - Update application
- `PUT /api/admin/applications/:id/stages/:stage` - Update stage
- `GET /api/admin/users` - List users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/courses` - List courses
- `POST /api/admin/courses` - Create course
- `PUT /api/admin/courses/:id` - Update course
- `DELETE /api/admin/courses/:id` - Delete course
- `GET /api/admin/tracking/stages` - Get tracking config
- `PUT /api/admin/tracking/stages` - Update tracking config

### Feed
- `GET /api/feed` - List posts
- `POST /api/feed` - Create post (pinned for admins)
- `DELETE /api/feed/:id` - Delete post

## 🐛 Troubleshooting

### Cannot connect to API

1. Check if backend is running: `http://localhost:5000`
2. Verify `.env.local` has correct API URL
3. Check CORS settings in backend

### Login fails

1. Verify admin account exists in database
2. Check backend logs for errors
3. Ensure user role is 'admin'

### Pages not loading

1. Clear browser cache
2. Restart development server
3. Check browser console for errors

## 📝 Development Notes

### Adding New Pages

1. Create page in `src/app/[page-name]/page.js`
2. Wrap with `<AdminLayout>`
3. Add navigation link in `AdminLayout.js`
4. Add API endpoints in `src/services/api.js`

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow existing color scheme (blue primary, gray neutrals)
- Maintain consistent spacing and typography
- Use responsive design (mobile-first)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the CTU Daanbantayan Campus Admission Portal system.

## 👥 Support

For issues or questions:
- Check the troubleshooting section
- Review backend API documentation
- Contact the development team

---

**Built with ❤️ for CTU Daanbantayan Campus**
