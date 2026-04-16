const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// @route   GET /api/tracking/:code — Look up application by tracking code
router.get('/:code', async (req, res) => {
  try {
    const application = await Application.findOne({ 
      trackingCode: req.params.code.toUpperCase() 
    });

    if (!application) {
      return res.status(404).json({ message: 'No application found with this tracking code' });
    }

    // Return full application data
    res.json(application);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
