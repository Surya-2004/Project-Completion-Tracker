const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendPasswordResetEmail, verifyTransporter } = require('../utils/emailService');

const router = express.Router();

// Test email configuration (for development only)
router.get('/test-email', async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.json({ 
        status: 'not_configured',
        message: 'Email credentials not configured',
        env: {
          EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'not_set',
          EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'not_set'
        }
      });
    }

    const isVerified = await verifyTransporter();
    res.json({ 
      status: isVerified ? 'ready' : 'failed',
      message: isVerified ? 'Email service is ready' : 'Email service verification failed',
      email: process.env.EMAIL_USER
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Email test failed',
      error: error.message 
    });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      organization
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email service not configured. Reset token:', resetToken);
      console.log('Reset URL:', resetUrl);
      return res.json({ 
        message: 'Password reset token generated',
        resetToken: resetToken, // Only for development
        resetUrl: resetUrl // Only for development
      });
    }

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl);
    
    if (emailSent) {
      res.json({ message: 'Password reset email sent' });
    } else {
      res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        organization: req.user.organization
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 