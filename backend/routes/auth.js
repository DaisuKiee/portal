const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');
const { auth } = require('../middleware/auth');
const { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, generateVerificationCode } = require('../config/email');
const speakeasy = require('speakeasy');
const { getDeviceInfo, getLocationInfo, getClientIp } = require('../utils/deviceDetection');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.fullName, verificationCode);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Please provide email and verification code' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // Verify user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Send welcome email
    sendWelcomeEmail(user.email, user.fullName);

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send new code
    await sendVerificationEmail(user.email, user.fullName, verificationCode);

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password, twoFactorCode, deviceInfo: clientDeviceInfo } = req.body;

    // Get device and location info
    const userAgent = req.headers['user-agent'] || '';
    const appVersion = clientDeviceInfo?.appVersion || '';
    const deviceInfo = getDeviceInfo(userAgent, appVersion);
    const clientIp = getClientIp(req);
    const location = getLocationInfo(clientIp);

    if (!email || !password) {
      console.log('Login failed: Missing credentials');
      
      // Log failed attempt
      if (email) {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          await LoginHistory.create({
            userId: user._id,
            action: 'failed_login',
            success: false,
            deviceInfo,
            location,
            failureReason: 'Missing credentials'
          });
        }
      }
      
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { email: user.email, isVerified: user.isVerified, twoFactorEnabled: user.twoFactorEnabled });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      
      // Log failed attempt
      await LoginHistory.create({
        userId: user._id,
        action: 'failed_login',
        success: false,
        deviceInfo,
        location,
        failureReason: 'Invalid password'
      });
      
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled for admin users
    if (user.role === 'admin' && user.twoFactorEnabled) {
      if (!twoFactorCode) {
        console.log('Login requires 2FA');
        return res.status(200).json({ 
          requiresTwoFactor: true,
          message: 'Please enter your 6-digit authentication code'
        });
      }

      // Verify 2FA code
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        // Check backup codes
        const backupCode = user.twoFactorBackupCodes.find(
          bc => bc.code === twoFactorCode.toUpperCase() && !bc.used
        );

        if (!backupCode) {
          console.log('Login failed: Invalid 2FA code');
          
          // Log failed 2FA attempt
          await LoginHistory.create({
            userId: user._id,
            action: '2fa_failed',
            success: false,
            deviceInfo,
            location,
            failureReason: 'Invalid 2FA code'
          });
          
          return res.status(400).json({ message: 'Invalid authentication code' });
        }

        // Mark backup code as used
        backupCode.used = true;
        await user.save();
        console.log('Login successful with backup code');
      } else {
        console.log('Login successful with 2FA code');
      }
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await Session.create({
      userId: user._id,
      token,
      deviceInfo,
      location,
      expiresAt
    });

    // Log successful login
    await LoginHistory.create({
      userId: user._id,
      action: 'login',
      success: true,
      deviceInfo,
      location
    });

    console.log('Login successful:', { email: user.email, isVerified: user.isVerified });
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', auth, async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Find and terminate the session
      const session = await Session.findOne({ token, userId: req.user._id });
      if (session) {
        session.isActive = false;
        await session.save();
      }

      // Log logout
      const userAgent = req.headers['user-agent'] || '';
      const appVersion = req.body.deviceInfo?.appVersion || '';
      const deviceInfo = getDeviceInfo(userAgent, appVersion);
      const clientIp = getClientIp(req);
      const location = getLocationInfo(clientIp);

      await LoginHistory.create({
        userId: req.user._id,
        action: 'logout',
        success: true,
        deviceInfo,
        location
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetCodeExpires;
    await user.save();

    // Send reset email
    try {
      await sendResetPasswordEmail(user.email, user.fullName, resetCode);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.resetPasswordCode !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    if (new Date() > user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Reset code expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
