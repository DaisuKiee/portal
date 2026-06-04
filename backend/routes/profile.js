const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get password hash
router.get('/password-hash', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({ 
      passwordHash: user.password,
      message: 'Password hash retrieved successfully'
    });
  } catch (error) {
    console.error('Get password hash error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { fullName, email, contactNumber, profilePicture } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (contactNumber) user.contactNumber = contactNumber;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// Two-Factor Authentication (2FA) Endpoints
// ============================================

// Enable 2FA - Generate secret and QR code
router.post('/2fa/enable', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `CTU Admission Portal (${user.email})`,
      issuer: 'CTU Admission Portal',
      length: 32,
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Generate backup codes (10 codes)
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      backupCodes.push({
        code: code,
        used: false,
      });
    }

    // Save secret and backup codes (but don't enable yet)
    user.twoFactorSecret = secret.base32;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes.map(bc => bc.code),
      message: 'Scan the QR code with your authenticator app and verify to enable 2FA',
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify 2FA code and complete setup
router.post('/2fa/verify', auth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: 'Please enable 2FA first' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps before/after for clock skew
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disable 2FA
router.post('/2fa/disable', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to disable 2FA' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Disable 2FA and clear secret
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get backup codes
router.get('/2fa/backup-codes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    const backupCodes = user.twoFactorBackupCodes.map(bc => ({
      code: bc.code,
      used: bc.used,
    }));

    res.json({ backupCodes });
  } catch (error) {
    console.error('Get backup codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate backup codes
router.post('/2fa/regenerate-backup-codes', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate new backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      backupCodes.push({
        code: code,
        used: false,
      });
    }

    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    res.json({
      backupCodes: backupCodes.map(bc => bc.code),
      message: 'Backup codes regenerated successfully',
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// Session Management Endpoints
// ============================================

const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const { getDeviceInfo, getLocationInfo, getClientIp } = require('../utils/deviceDetection');

// Get active sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user.id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ loginTime: -1 });

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Terminate a specific session
router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Terminate session
    session.isActive = false;
    await session.save();

    // Log the termination
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = getDeviceInfo(userAgent);
    const clientIp = getClientIp(req);
    const location = getLocationInfo(clientIp);

    await LoginHistory.create({
      userId: req.user.id,
      action: 'session_terminated',
      success: true,
      deviceInfo,
      location
    });

    res.json({ message: 'Session terminated successfully' });
  } catch (error) {
    console.error('Terminate session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Terminate all other sessions (except current)
router.delete('/sessions', auth, async (req, res) => {
  try {
    const currentToken = req.header('Authorization')?.replace('Bearer ', '');

    // Find all active sessions except current
    const sessions = await Session.find({
      userId: req.user.id,
      isActive: true,
      token: { $ne: currentToken }
    });

    // Terminate all sessions
    await Session.updateMany(
      {
        userId: req.user.id,
        isActive: true,
        token: { $ne: currentToken }
      },
      {
        $set: { isActive: false }
      }
    );

    // Log the termination
    const userAgent = req.headers['user-agent'] || '';
    const deviceInfo = getDeviceInfo(userAgent);
    const clientIp = getClientIp(req);
    const location = getLocationInfo(clientIp);

    await LoginHistory.create({
      userId: req.user.id,
      action: 'session_terminated',
      success: true,
      deviceInfo,
      location
    });

    res.json({ 
      message: 'All other sessions terminated successfully',
      count: sessions.length
    });
  } catch (error) {
    console.error('Terminate all sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// Login History Endpoints
// ============================================

// Get login history with pagination and filters
router.get('/login-history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { userId: req.user.id };
    if (action) {
      query.action = action;
    }

    // Get total count
    const total = await LoginHistory.countDocuments(query);

    // Get history with pagination
    const history = await LoginHistory.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// Data Privacy Endpoints
// ============================================

const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { sendEmail } = require('../config/email');

// Request data export
router.post('/data-export', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Gather all user data
    const userData = {
      profile: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      security: {
        twoFactorEnabled: user.twoFactorEnabled,
        hasProfilePicture: !!user.profilePicture
      }
    };

    // Get user's application if exists
    try {
      const application = await Application.findOne({ userId: req.user.id });
      if (application) {
        userData.application = {
          trackingCode: application.trackingCode,
          status: application.status,
          course: application.course,
          submittedAt: application.createdAt,
          lastUpdated: application.updatedAt
        };
      }
    } catch (err) {
      console.log('No application found for user');
    }

    // Get user's sessions
    const sessions = await Session.find({ userId: req.user.id }).select('-token');
    userData.sessions = sessions;

    // Get user's login history (last 100 entries)
    const loginHistory = await LoginHistory.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100);
    userData.loginHistory = loginHistory;

    // Get user's notifications (last 50)
    try {
      const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);
      userData.notifications = notifications;
    } catch (err) {
      console.log('No notifications found for user');
    }

    // Send email with data
    const dataJson = JSON.stringify(userData, null, 2);
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Your CTU Admission Portal Data Export',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Your Data Export</h2>
            <p>Hello ${user.fullName},</p>
            <p>As requested, here is a copy of your data from the CTU Admission Portal.</p>
            <p>This export includes:</p>
            <ul>
              <li>Profile information</li>
              <li>Security settings</li>
              <li>Application data (if submitted)</li>
              <li>Active sessions</li>
              <li>Login history (last 100 entries)</li>
              <li>Notifications (last 50)</li>
            </ul>
            <p><strong>Note:</strong> For security reasons, passwords and authentication secrets are not included in this export.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                If you did not request this data export, please contact support immediately.
              </p>
            </div>
            <p>Best regards,<br>CTU Admission Portal Team</p>
          </div>
        `,
        attachments: [
          {
            filename: `ctu-data-export-${Date.now()}.json`,
            content: dataJson,
            contentType: 'application/json'
          }
        ]
      });

      res.json({ 
        message: 'Data export sent to your email',
        email: user.email
      });
    } catch (emailError) {
      console.error('Failed to send data export email:', emailError);
      // Still return the data even if email fails
      res.json({
        message: 'Data export prepared (email delivery failed)',
        data: userData
      });
    }
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    // Validate password
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Validate confirmation text
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ message: 'Confirmation text does not match' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Delete all user data
    try {
      // Delete sessions
      await Session.deleteMany({ userId: req.user.id });
      
      // Delete login history
      await LoginHistory.deleteMany({ userId: req.user.id });
      
      // Delete application if exists
      await Application.deleteMany({ userId: req.user.id });
      
      // Delete notifications
      await Notification.deleteMany({ userId: req.user.id });
      
      // Delete user account
      await User.findByIdAndDelete(req.user.id);

      // Send confirmation email
      try {
        await sendEmail({
          to: user.email,
          subject: 'Account Deleted - CTU Admission Portal',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a2e;">Account Deleted</h2>
              <p>Hello ${user.fullName},</p>
              <p>Your CTU Admission Portal account has been permanently deleted as requested.</p>
              <p>All your data including:</p>
              <ul>
                <li>Profile information</li>
                <li>Application data</li>
                <li>Login history</li>
                <li>Sessions</li>
                <li>Notifications</li>
              </ul>
              <p>has been permanently removed from our systems.</p>
              <p>If you did not request this deletion, please contact support immediately at support@ctu.edu.ph</p>
              <p>We're sorry to see you go. If you change your mind, you can create a new account anytime.</p>
              <p>Best regards,<br>CTU Admission Portal Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send account deletion email:', emailError);
      }

      res.json({ 
        message: 'Account deleted successfully',
        email: user.email
      });
    } catch (deleteError) {
      console.error('Error deleting user data:', deleteError);
      res.status(500).json({ message: 'Failed to delete account data' });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
