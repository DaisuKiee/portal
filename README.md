# AI-Integrated Mobile-Based CTU Admission Portal in Daanbantayan Campus

## Overview
A modern, intelligent mobile application for streamlining the admission process at Cebu Technological University (CTU) - Daanbantayan Campus. This system integrates AI-powered course recommendations with a comprehensive admission management platform.

## Features

### 🎓 Student Features
- **User Authentication**
  - Secure registration with email verification
  - Login with JWT token authentication
  - Password reset functionality with email verification
  - Strong password requirements (8+ chars, uppercase, lowercase, numbers, symbols)

- **AI-Powered Course Recommendation**
  - Interactive pretest assessment
  - Intelligent course matching based on student responses
  - Personalized career prospects and analysis
  - Alternative course suggestions

- **Application Management**
  - 4-step admission form with modern UI
  - Document upload support
  - Real-time application tracking
  - Unique tracking code generation

- **Social Features**
  - News feed with posts and comments
  - User profiles with customization
  - Real-time notifications
  - Activity tracking

- **Account Management**
  - Profile editing
  - Password change
  - Notification settings
  - Privacy and security controls

### 🔔 Notification System
- Push notification support
- Permission request on first launch
- Notification preferences management
- Real-time updates

### 🎨 Modern UI/UX
- CTU-branded design with background imagery
- Glassmorphism effects
- Smooth animations and transitions
- Side drawer navigation
- Dark theme with CTU colors
- Responsive layouts

## Technology Stack

### Frontend (Mobile)
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **UI Components**: Custom components with Ionicons
- **Notifications**: expo-notifications
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Toast Notifications**: react-native-toast-message

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **Environment Variables**: dotenv

## Project Structure

```
├── mobile/                      # React Native mobile app
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── screens/            # App screens
│   │   ├── navigation/         # Navigation configuration
│   │   ├── services/           # API services
│   │   ├── config/             # Configuration files
│   │   └── styles/             # Theme and styles
│   ├── assets/                 # Images and resources
│   └── App.js                  # Main app entry
│
├── backend/                     # Node.js backend server
│   ├── config/                 # Database and email config
│   ├── middleware/             # Authentication middleware
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   └── server.js               # Server entry point
│
└── README.md                   # Project documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Expo CLI
- Android Studio or Xcode (for mobile development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

4. Start the server:
```bash
npm start
# or
node server.js
```

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API configuration in `src/config/apiConfig.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://YOUR_IP_ADDRESS:5000/api',
  TIMEOUT: 30000,
};
```

4. Start the app:
```bash
npx expo start
```

5. Scan QR code with Expo Go app (Android/iOS)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify email with code
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code
- `GET /api/auth/me` - Get current user

### Application
- `POST /api/application` - Submit application
- `GET /api/application/me` - Get user's application
- `PUT /api/application/:id` - Update application

### Feed
- `GET /api/feed` - Get all posts
- `POST /api/feed` - Create new post
- `POST /api/feed/:id/comments` - Add comment to post

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `PUT /api/profile/change-password` - Change password

## Key Features Implementation

### Password Security
- Minimum 8 characters
- Must include uppercase, lowercase, numbers, and symbols
- Real-time strength validation with visual feedback
- Secure hashing with bcrypt

### Email Verification
- 6-digit verification codes
- 10-minute expiration
- Resend code functionality
- Welcome emails on successful verification

### Application Tracking
- Unique tracking codes (e.g., CTU-2026-XXXXX)
- Real-time status updates
- Document checklist
- Progress tracking

### AI Course Recommendation
- Personality-based assessment
- Interest and skill evaluation
- Career alignment analysis
- Match percentage calculation

## Academic Year
**2026-2027**

## Target Users
- Senior High School graduates
- Transferees
- Second-degree applicants
- CTU Daanbantayan Campus applicants

## Development Team
Cebu Technological University - Daanbantayan Campus

## License
Proprietary - CTU Daanbantayan Campus

## Support
For technical support or inquiries, please contact the CTU Daanbantayan Campus Registrar's Office.

---

**Note**: This is an official admission portal for CTU Daanbantayan Campus. All information provided must be accurate and truthful. Falsification of documents or information shall be grounds for disqualification.
