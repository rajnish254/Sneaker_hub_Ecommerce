/**
 * AUTHENTICATION ROUTES
 * User registration, login, and token management
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { loginLimiter, signupLimiter } = require('../middleware/rateLimiter');
const inMemory = require('../utils/inMemoryStorage');
const { sendOTPEmail } = require('../utils/emailService');

const router = express.Router();

// Helper function to validate email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Try to use User model, fallback to in-memory storage
let useInMemory = true;

// Helper function to check MongoDB connection
function isMongoDBConnected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1; // 1 = connected
}

// Check MongoDB connection after a short delay to allow server to initialize
setTimeout(() => {
  if (isMongoDBConnected()) {
    useInMemory = false;
    console.log('✅ Using MongoDB for auth');
  } else {
    useInMemory = true;
    console.log('⚠️  Using in-memory storage for auth (MongoDB not connected)');
  }
}, 500);

// Also check on first request and update if needed
function checkMongoDBConnection() {
  if (!useInMemory && !isMongoDBConnected()) {
    useInMemory = true;
  } else if (useInMemory && isMongoDBConnected()) {
    useInMemory = false;
  }
}

// Wrapper function to handle user operations
async function findUserByEmail(email) {
  if (useInMemory) {
    return await inMemory.findUserByEmail(email);
  }
  return await User.findOne({ email: email.toLowerCase() });
}

async function createUser(data) {
  if (useInMemory) {
    return await inMemory.createUser(data.email, data.password, data.firstName, data.lastName);
  }
  const user = new User(data);
  await user.save();
  return user;
}

async function findUserById(id) {
  if (useInMemory) {
    return await inMemory.findUserById(id);
  }
  return await User.findById(id);
}

// ============== REGISTER ==============
router.post('/register', signupLimiter, async (req, res) => {
  try {
    checkMongoDBConnection(); // Update connection status
    
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName) {
      return res.status(400).json({ error: 'Email, password, and first name are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary user with OTP
    const tempUser = await createUser({
      email,
      password,
      firstName,
      lastName: lastName || '',
      otp,
      otpExpiry,
      emailVerified: false
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, firstName);
    if (emailResult.success) {
      console.log(`✅ OTP sent to ${email}`);
    } else {
      console.error(`❌ Failed to send OTP to ${email}:`, emailResult.error);
    }

    res.status(201).json({
      message: 'User registered. Please verify with OTP sent to your email',
      email,
      requiresOTP: true
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== VERIFY OTP ==============
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP validity
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Mark email as verified and clear OTP
    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    
    if (useInMemory) {
      await inMemory.updateUser(user._id, { emailVerified: true });
    } else {
      await user.save();
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== RESEND OTP ==============
router.post('/resend-otp', signupLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    
    if (useInMemory) {
      await inMemory.updateUser(user._id, { otp, otpExpiry });
    } else {
      await user.save();
    }

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, user.firstName || 'User');
    if (emailResult.success) {
      console.log(`✅ OTP resent to ${email}`);
    } else {
      console.error(`❌ Failed to resend OTP to ${email}:`, emailResult.error);
    }

    res.json({ message: 'OTP resent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== LOGIN ==============
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== GET CURRENT USER ==============
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user without password
    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============== FORGOT PASSWORD ==============
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If email exists, OTP will be sent' });
    }

    // Generate OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP
    if (useInMemory) {
      await inMemory.updateUser(user._id || user.email, { otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, user.firstName || 'User', 'reset');
    if (emailResult.success) {
      console.log(`✅ Password reset OTP sent to ${email}`);
    } else {
      console.error(`❌ Failed to send password reset OTP to ${email}:`, emailResult.error);
    }

    res.json({
      message: 'If email exists, OTP will be sent for password reset',
      email
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== RESET PASSWORD ==============
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    // Update password and clear OTP
    if (useInMemory) {
      await inMemory.updateUser(user._id || user.email, { password: newPassword, otp: null, otpExpiry: null });
    } else {
      user.password = newPassword;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
    }

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== VERIFY TOKEN ==============
router.post('/verify-token', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
