/**
 * GOOGLE OAUTH ROUTES
 * Handles Google Sign-In token verification and user creation/update
 */

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const inMemory = require('../utils/inMemoryStorage');

const router = express.Router();

// Initialize Google OAuth2Client
const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google/verify
 * Verify Google ID token and create/update user
 * Body param: allowSignup (true only on signup page)
 */
router.post('/google/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const allowSignup = req.body.allowSignup === true; // Check if signup is allowed (from request body)

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    console.log('🔐 Verifying Google token...');
    console.log('📝 Auto-signup allowed:', allowSignup);

    // Verify the token with Google
    try {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const userId = payload['sub']; // Google unique ID
      const email = payload['email'];
      const firstName = payload['given_name'] || 'User';
      const picture = payload['picture'] || '';

      console.log('✅ Google token verified for:', email);

      // Check if user exists in MongoDB
      let user = null;
      let isNewUser = false;
      const mongoConnected = require('../utils/inMemoryStorage').mongoConnected || 
        (require('mongoose').connection.readyState === 1);

      if (mongoConnected) {
        try {
          user = await User.findOne({ email });
          
          // LOGIC:
          // On Signup Page (allowSignup=true): Only create NEW users
          // On Login Page (allowSignup=false): Only login EXISTING users
          
          if (allowSignup) {
            // SIGNUP PAGE: User trying to create account
            if (user) {
              // Account already exists
              console.log('❌ User already exists, cannot create duplicate account');
              return res.status(409).json({ 
                error: 'Account already exists with this email. Please sign in instead.',
                accountExists: true
              });
            }
            
            // Create new user from Google profile
            console.log('👤 Creating new user from Google profile...');
            user = new User({
              email,
              firstName,
              password: 'google-oauth-' + userId, // Placeholder - won't be used for login
              isGoogleUser: true,
              googleId: userId,
              profilePicture: picture
            });

            await user.save();
            isNewUser = true;
            console.log('✅ New user created from Google OAuth');
          } else {
            // LOGIN PAGE: User trying to sign in
            if (!user) {
              // Account doesn't exist
              console.log('❌ User not found - account does not exist');
              return res.status(401).json({ 
                error: 'Account does not exist. Please sign up first using the Sign Up page with Google or create an account with email and password.',
                requiresSignup: true
              });
            }
            
            // Update Google OAuth info if needed
            if (!user.isGoogleUser) {
              user.isGoogleUser = true;
              user.googleId = userId;
            }
            if (picture && !user.profilePicture) {
              user.profilePicture = picture;
            }
            await user.save();
            console.log('✅ User authenticated via Google OAuth');
          }
        } catch (dbError) {
          console.error('❌ MongoDB error:', dbError.message);
          // Fallback to in-memory for development
          throw new Error('Database error: ' + dbError.message);
        }
      } else {
        // Create in-memory user for development
        console.log('⚠️  MongoDB not connected, using in-memory storage');
        user = {
          _id: 'user_' + Date.now(),
          email,
          firstName,
          isGoogleUser: true,
          googleId: userId,
          profilePicture: picture
        };
        isNewUser = true;
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          isGoogleUser: true
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '7d' }
      );

      console.log('🎫 JWT token generated for user:', user._id);

      // Log user into store if using in-memory
      if (!mongoConnected && inMemory.createUser) {
        user.password = 'google-oauth-placeholder';
        await inMemory.createUser(user);
      }

      res.json({
        success: true,
        token: jwtToken,
        user: {
          userId: user._id,
          email: user.email,
          firstName: user.firstName,
          profilePicture: user.profilePicture || picture,
          isGoogleUser: true
        },
        isNewUser
      });

    } catch (tokenError) {
      console.error('❌ Token verification failed:', tokenError.message);
      return res.status(401).json({
        error: 'Invalid or expired token',
        details: tokenError.message
      });
    }

  } catch (err) {
    console.error('🔴 Google auth error:', err.message);
    res.status(500).json({
      error: 'Google authentication failed',
      details: err.message
    });
  }
});

/**
 * POST /api/auth/google/client-config
 * Return safe Google Client ID (for frontend)
 */
router.get('/google/client-config', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(400).json({ 
      error: 'Google Client ID not configured',
      configured: false 
    });
  }

  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID,
    configured: true
  });
});

module.exports = router;
