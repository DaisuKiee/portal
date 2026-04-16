# Web Admin Installation Guide

## ✅ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd web-admin
npm install
```

This will install:
- Next.js 14
- React 18
- Tailwind CSS
- Axios
- date-fns

### Step 2: Verify Files

Make sure these files exist:

```
✅ package.json
✅ next.config.js
✅ tailwind.config.js
✅ postcss.config.js
✅ .env.local
✅ src/app/layout.js
✅ src/app/page.js
✅ src/app/globals.css
✅ src/components/AdminLayout.js
✅ src/services/api.js
✅ src/utils/auth.js
✅ src/utils/formatters.js
✅ src/app/dashboard/page.js
✅ src/app/applications/page.js
✅ src/app/applications/[id]/page.js
✅ src/app/users/page.js
✅ src/app/courses/page.js
✅ src/app/posts/page.js
✅ src/app/settings/page.js
```

### Step 3: Start Backend

Make sure your backend is running:

```bash
cd ../backend
npm start
```

Backend should be running on `http://localhost:5000`

### Step 4: Start Web Admin

```bash
cd ../web-admin
npm run dev
```

### Step 5: Access Admin Panel

Open your browser and go to:
```
http://localhost:3000
```

Login with:
- **Email:** admin@ctu.edu.ph
- **Password:** admin123

## 🎉 You're Done!

You should now see the admin dashboard with:
- Statistics cards
- Create announcement section
- Quick action buttons
- Navigation sidebar

## 📋 What You Can Do

### Dashboard
- View real-time statistics
- Create pinned announcements
- Quick access to all sections

### Applications
- View all applications
- Filter by status (pending, approved, rejected)
- Search by tracking code or name
- Click "View Details" to manage stages
- Approve or reject applications

### Application Details
- View full applicant information
- Manage 6 admission stages
- Update stage status (pending/completed)
- Add details/notes to each stage
- Approve/reject application

### Users
- View all registered users
- Search by name or email
- See verification status
- Delete non-admin users

### Courses
- Add new courses
- Edit existing courses
- Delete courses
- View course codes and descriptions

### Posts
- View all feed posts
- See pinned announcements
- Delete posts
- Search by content or author

### Settings
- Configure tracking stages
- Enable/disable stages
- Add stage descriptions
- View system information

## 🔧 Troubleshooting

### Port 3000 already in use

```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Cannot connect to backend

1. Check backend is running: `http://localhost:5000`
2. Update `.env.local` if backend is on different port
3. Check firewall settings

### Login not working

1. Verify admin account exists in database
2. Check backend console for errors
3. Clear browser cache and cookies

### Pages showing errors

1. Make sure all files are created
2. Check browser console for errors
3. Restart development server

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Environment Variables for Production

Update `.env.local` with production API URL:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## 📱 Mobile App Note

**Important:** Admin users cannot access the mobile app. They will be automatically logged out with a message to use the web admin panel.

This ensures:
- Better admin experience on desktop
- Proper separation of concerns
- Optimized UI for each platform

## ✨ Features Summary

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Statistics and quick actions |
| 📝 Applications | Full application management |
| 👥 Users | User management and search |
| 📚 Courses | CRUD operations for courses |
| 📰 Posts | Feed post management |
| ⚙️ Settings | System configuration |

## 🎯 Next Steps

1. ✅ Login to admin panel
2. ✅ Explore the dashboard
3. ✅ Create a test announcement
4. ✅ View applications (if any exist)
5. ✅ Add some courses
6. ✅ Configure tracking stages

## 💡 Tips

- Use the search bars to quickly find items
- Pinned announcements appear at top of student feed
- Stage updates are visible to students in real-time
- All actions are logged in backend console
- Use Chrome DevTools for debugging

## 📞 Need Help?

- Check the README.md for detailed documentation
- Review backend API logs
- Check browser console for errors
- Verify all environment variables are set

---

**Congratulations! Your CTU Admin Panel is ready to use! 🎉**
