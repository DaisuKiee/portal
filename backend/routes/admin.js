const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');

// All routes require admin authentication
router.use(adminAuth);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalUsers,
      verifiedUsers,
    ] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
    ]);

    res.json({
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalUsers,
      verifiedUsers,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/applications
// @desc    Get all applications with optional filter
router.get('/applications', async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    
    let query = {};
    if (filter !== 'all') {
      query.status = filter;
    }

    const applications = await Application.find(query)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    // Transform data to include user info at root level
    const transformedApps = applications.map(app => {
      const appObj = app.toObject();
      return {
        ...appObj,
        fullName: appObj.userId?.fullName || `${appObj.personalInfo?.firstName || ''} ${appObj.personalInfo?.lastName || ''}`.trim(),
        email: appObj.userId?.email || appObj.personalInfo?.email || '',
        selectedCourse: appObj.preferredCourse || '',
      };
    });

    res.json(transformedApps);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/applications/:id/status
// @desc    Update application status
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (remarks) {
      application.remarks = remarks;
    }
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();

    await application.save();

    // Create notification for user
    await Notification.create({
      user: application.userId,
      type: 'application_update',
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your application (${application.trackingCode}) has been ${status}${remarks ? ': ' + remarks : ''}`,
      data: { applicationId: application._id },
    });

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with optional filter and application status
router.get('/users', async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    
    let query = {};
    if (filter === 'verified') {
      query.isVerified = true;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get application status for each user
    const usersWithApplications = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        // Find application for this user
        const application = await Application.findOne({ userId: user._id })
          .select('status trackingCode submittedAt')
          .sort({ submittedAt: -1 });

        return {
          ...userObj,
          application: application ? {
            status: application.status,
            trackingCode: application.trackingCode,
            submittedAt: application.submittedAt,
            hasApplication: true
          } : {
            hasApplication: false
          }
        };
      })
    );

    res.json(usersWithApplications);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/applications/:id/stages
// @desc    Update application tracking stages and details
router.put('/applications/:id/stages', async (req, res) => {
  try {
    console.log('Updating stages for application:', req.params.id);
    console.log('Request body:', req.body);

    const {
      stages,
      examDetails,
      interviewDetails,
      enrollmentDetails,
      idDetails,
      disqualificationReasons,
    } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      console.log('Application not found:', req.params.id);
      return res.status(404).json({ message: 'Application not found' });
    }

    console.log('Current application stages:', application.stages);

    if (stages) application.stages = stages;
    if (examDetails !== undefined) application.examDetails = examDetails;
    if (interviewDetails !== undefined) application.interviewDetails = interviewDetails;
    if (enrollmentDetails !== undefined) application.enrollmentDetails = enrollmentDetails;
    if (idDetails !== undefined) application.idDetails = idDetails;
    if (disqualificationReasons !== undefined) application.disqualificationReasons = disqualificationReasons;

    await application.save();

    console.log('Updated application stages:', application.stages);

    // Create notification for user
    await Notification.create({
      user: application.userId,
      type: 'application_update',
      title: 'Application Status Updated',
      message: `Your application tracking has been updated. Check your tracking page for details.`,
      data: { applicationId: application._id },
    });

    res.json({ message: 'Tracking stages updated', application });
  } catch (error) {
    console.error('Update stages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/applications/:id
// @desc    Get single application details
router.get('/applications/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'fullName email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const appObj = application.toObject();
    const transformedApp = {
      ...appObj,
      fullName: appObj.userId?.fullName || `${appObj.personalInfo?.firstName || ''} ${appObj.personalInfo?.lastName || ''}`.trim(),
      email: appObj.userId?.email || appObj.personalInfo?.email || '',
      selectedCourse: appObj.preferredCourse || '',
    };

    res.json(transformedApp);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/applications/:id
// @desc    Update application
router.put('/applications/:id', async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      application.status = status;
      application.reviewedBy = req.user._id;
      application.reviewedAt = new Date();
    }

    if (remarks !== undefined) {
      application.remarks = remarks;
    }

    await application.save();

    // Create notification for user
    if (status) {
      await Notification.create({
        user: application.userId,
        type: 'application_update',
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your application (${application.trackingCode}) has been ${status}${remarks ? ': ' + remarks : ''}`,
        data: { applicationId: application._id },
      });
    }

    res.json({ message: 'Application updated', application });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Course Management Routes
const Course = require('../models/Course');

// @route   GET /api/admin/courses
// @desc    Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/courses
// @desc    Create a new course
router.post('/courses', async (req, res) => {
  try {
    const { code, name, description, careerProspects, keywords, studentLimit, minimumGWA } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      code,
      name,
      description,
      careerProspects: careerProspects || [],
      keywords: keywords || [],
      studentLimit: studentLimit || null,
      minimumGWA: minimumGWA || null,
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/courses/:id
// @desc    Update a course
router.put('/courses/:id', async (req, res) => {
  try {
    const { code, name, description, careerProspects, keywords, studentLimit, minimumGWA } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if new code conflicts with another course
    if (code && code !== course.code) {
      const existingCourse = await Course.findOne({ code });
      if (existingCourse) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
    }

    if (code) course.code = code;
    if (name) course.name = name;
    if (description !== undefined) course.description = description;
    if (careerProspects !== undefined) course.careerProspects = careerProspects;
    if (keywords !== undefined) course.keywords = keywords;
    if (studentLimit !== undefined) course.studentLimit = studentLimit;
    if (minimumGWA !== undefined) course.minimumGWA = minimumGWA;

    await course.save();
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/courses/:id
// @desc    Delete a course
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post Management Routes
const Post = require('../models/Post');

// @route   GET /api/admin/posts
// @desc    Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'fullName email role')
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => ({
      id: post._id,
      author: {
        name: post.authorName || post.author?.fullName || 'Unknown User',
        role: post.author?.role || post.authorRole,
      },
      content: post.content,
      isPinned: post.isPinned || false,
      commentsCount: post.comments.length,
      createdAt: post.createdAt,
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/posts/:id
// @desc    Delete a post
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tracking Configuration Routes
// @route   GET /api/admin/tracking/stages
// @desc    Get tracking stage configuration
router.get('/tracking/stages', async (req, res) => {
  try {
    // Return default configuration
    // In a real app, this would be stored in database
    const stages = {
      exam: {
        enabled: true,
        name: 'Entrance Exam',
        description: 'Take the entrance examination',
      },
      interview: {
        enabled: true,
        name: 'Interview',
        description: 'Attend the scheduled interview',
      },
      medicalExam: {
        enabled: true,
        name: 'Medical Exam',
        description: 'Complete medical examination',
      },
      enrollment: {
        enabled: true,
        name: 'Enrollment',
        description: 'Complete enrollment process',
      },
      idProcessing: {
        enabled: true,
        name: 'ID Processing',
        description: 'Process student ID',
      },
      disqualification: {
        enabled: true,
        name: 'Disqualification',
        description: 'Application disqualified',
      },
    };

    res.json(stages);
  } catch (error) {
    console.error('Get tracking stages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/tracking/stages
// @desc    Update tracking stage configuration
router.put('/tracking/stages', async (req, res) => {
  try {
    // In a real app, this would update database
    // For now, just return success
    res.json({ message: 'Tracking stages updated successfully', stages: req.body });
  } catch (error) {
    console.error('Update tracking stages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
