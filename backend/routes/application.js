const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendApplicationSubmittedEmail } = require('../config/email');

// @route   POST /api/application — Submit application
router.post('/', auth, async (req, res) => {
  try {
    // Check if user already has an application
    const existing = await Application.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ 
        message: 'You already have an application submitted',
        trackingCode: existing.trackingCode
      });
    }

    const {
      personalInfo,
      programData,
      educationalBackground,
      familyBackground,
      preferredCourse,
      aiRecommendedCourse,
      aiAnalysis,
      pretestAnswers,
      documentsAcknowledged,
      documents
    } = req.body;

    const trackingCode = 'CTU-' + uuidv4().substring(0, 8).toUpperCase();

    const application = new Application({
      userId: req.user._id,
      trackingCode,
      personalInfo,
      programData: programData || {},
      educationalBackground: educationalBackground || {},
      familyBackground: familyBackground || {},
      preferredCourse,
      aiRecommendedCourse: aiRecommendedCourse || '',
      aiAnalysis: aiAnalysis || '',
      pretestAnswers: pretestAnswers || {},
      documentsAcknowledged: documentsAcknowledged || false,
      documents: documents || {},
      submittedAt: new Date()
    });

    await application.save();

    // Create notification for user
    await Notification.create({
      user: req.user._id,
      type: 'application_submitted',
      title: 'Application Submitted Successfully',
      message: `Your application has been submitted. Tracking code: ${trackingCode}`,
      data: { trackingCode }
    });

    // Send email notification
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        const fullName = user.fullName || 'Student';
        await sendApplicationSubmittedEmail(user.email, fullName, trackingCode);
      }
    } catch (emailError) {
      console.error('Error sending application email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      trackingCode: application.trackingCode,
      application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/application/me — Get current user's application
router.get('/me', auth, async (req, res) => {
  try {
    const application = await Application.findOne({ userId: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'No application found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/application/:id — Update application
router.put('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      application[key] = updates[key];
    });

    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
