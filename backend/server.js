require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const applicationRoutes = require('./routes/application');
const pretestRoutes = require('./routes/pretest');
const trackingRoutes = require('./routes/tracking');
const feedRoutes = require('./routes/feed');
const notificationRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/pretest', pretestRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CTU Admission Portal API is running' });
});

// Seed default courses if none exist
const Course = require('./models/Course');
const seedCourses = async () => {
  try {
    // Drop any stale indexes that might conflict
    try {
      const indexes = await Course.collection.indexes();
      for (const idx of indexes) {
        if (idx.name !== '_id_' && idx.name !== 'code_1') {
          await Course.collection.dropIndex(idx.name);
          console.log(`Dropped stale index: ${idx.name}`);
        }
      }
    } catch (e) {
      // Collection might not exist yet, that's fine
    }

    const count = await Course.countDocuments();
    if (count === 0) {
      const defaultCourses = [
        {
          code: 'BSIT',
          name: 'Bachelor of Science in Information Technology',
          description: 'Focuses on software development, web development, database management, and IT systems.',
          careerProspects: ['Software Developer', 'Web Developer', 'IT Support Specialist', 'Database Administrator', 'Systems Analyst', 'Network Administrator'],
          keywords: ['technology', 'computers', 'programming', 'software', 'web', 'coding', 'internet', 'digital', 'apps']
        },
        {
          code: 'BSIE',
          name: 'Bachelor of Science in Industrial Engineering',
          description: 'Focuses on optimizing complex processes, systems, and organizations through engineering principles and management.',
          careerProspects: ['Industrial Engineer', 'Process Engineer', 'Quality Control Manager', 'Production Manager', 'Operations Analyst', 'Supply Chain Manager'],
          keywords: ['engineering', 'manufacturing', 'processes', 'optimization', 'systems', 'production', 'efficiency', 'management', 'problem-solving']
        },
        {
          code: 'BIT-COMTECH',
          name: 'Bachelor in Industrial Technology - Computer Technology',
          description: 'Focuses on computer hardware, networking, troubleshooting, and technical support.',
          careerProspects: ['Computer Technician', 'Network Technician', 'IT Support', 'Hardware Specialist', 'Technical Support Engineer'],
          keywords: ['computers', 'hardware', 'repair', 'networking', 'technical', 'troubleshooting', 'fixing', 'maintenance']
        },
        {
          code: 'BIT-ELECTRONICS',
          name: 'Bachelor in Industrial Technology - Electronics Technology',
          description: 'Focuses on electronic systems, circuits, devices, and telecommunications.',
          careerProspects: ['Electronics Technician', 'Telecommunications Specialist', 'Electronics Engineer', 'Instrumentation Technician', 'Service Technician'],
          keywords: ['electronics', 'circuits', 'devices', 'telecommunications', 'technical', 'gadgets', 'repair', 'systems']
        },
        {
          code: 'BIT-AUTOMOTIVE',
          name: 'Bachelor in Industrial Technology - Automotive Technology',
          description: 'Focuses on vehicle maintenance, repair, diagnostics, and automotive systems.',
          careerProspects: ['Automotive Technician', 'Mechanic', 'Service Advisor', 'Automotive Engineer', 'Shop Owner', 'Vehicle Inspector'],
          keywords: ['automotive', 'cars', 'vehicles', 'mechanic', 'repair', 'engines', 'maintenance', 'driving', 'machines']
        },
        {
          code: 'BEED',
          name: 'Bachelor of Elementary Education',
          description: 'Prepares students to become licensed professional teachers for elementary education (Grades 1-6).',
          careerProspects: ['Elementary Teacher', 'School Administrator', 'Education Specialist', 'Day Care Teacher', 'Tutorial Center Owner', 'Curriculum Developer'],
          keywords: ['teaching', 'children', 'elementary', 'education', 'nurturing', 'kids', 'learning', 'helping', 'young students']
        },
        {
          code: 'BSED',
          name: 'Bachelor of Secondary Education',
          description: 'Prepares students to become licensed professional teachers for secondary education (high school level).',
          careerProspects: ['High School Teacher', 'School Administrator', 'Education Specialist', 'Curriculum Developer', 'Guidance Counselor', 'Subject Coordinator'],
          keywords: ['teaching', 'education', 'helping', 'students', 'learning', 'mentoring', 'school', 'teenagers', 'high school']
        },
        {
          code: 'BTLED',
          name: 'Bachelor of Technology and Livelihood Education',
          description: 'Prepares students to teach technical and vocational subjects in secondary schools.',
          careerProspects: ['TLE Teacher', 'Vocational Instructor', 'Skills Trainer', 'Technical Education Specialist', 'Entrepreneurship Teacher'],
          keywords: ['teaching', 'technical', 'vocational', 'skills', 'livelihood', 'hands-on', 'practical', 'training', 'entrepreneurship']
        },
        {
          code: 'BSHM',
          name: 'Bachelor of Science in Hospitality Management',
          description: 'Focuses on hotel and restaurant management, tourism, food service, and the hospitality industry.',
          careerProspects: ['Hotel Manager', 'Restaurant Manager', 'Event Planner', 'Tourism Officer', 'Chef', 'Resort Manager', 'Food Service Manager'],
          keywords: ['hospitality', 'hotel', 'restaurant', 'food', 'cooking', 'tourism', 'travel', 'service', 'events', 'customer service']
        }
      ];

      await Course.insertMany(defaultCourses);
      console.log('Default courses seeded successfully');
    }
  } catch (error) {
    console.error('Seed courses error (non-fatal):', error.message);
  }
};

// Seed default admin if none exists
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const seedAdmin = async () => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        fullName: 'Admin',
        email: 'admin@ctu.edu.ph',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin created: admin@ctu.edu.ph / admin123');
    }
  } catch (error) {
    console.error('Seed admin error (non-fatal):', error.message);
  }
};

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

const server = app.listen(PORT, HOST, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accessible at:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://10.43.137.235:${PORT}`);
  console.log(`  - All IPs: http://0.0.0.0:${PORT}`);
  await seedCourses();
  await seedAdmin();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} is already in use. Kill the other process or change PORT in .env\n`);
    process.exit(1);
  }
  throw err;
});

