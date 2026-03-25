const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/courses — Get all active courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ code: 1 });
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/all — Get all courses including inactive (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses — Create course (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { code, name, description, careerProspects, keywords } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: 'Course code and name are required' });
    }

    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      code: code.toUpperCase(),
      name,
      description: description || '',
      careerProspects: careerProspects || [],
      keywords: keywords || []
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id — Update course (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { code, name, description, careerProspects, keywords, isActive } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (code) course.code = code.toUpperCase();
    if (name) course.name = name;
    if (description !== undefined) course.description = description;
    if (careerProspects) course.careerProspects = careerProspects;
    if (keywords) course.keywords = keywords;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id — Delete course (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
