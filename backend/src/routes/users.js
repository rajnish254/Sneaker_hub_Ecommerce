/**
 * USER ROUTES
 * Handle user profile, cart, and wishlist sync
 */

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Helper function to check MongoDB connection
function isMongoDBConnected() {
  return mongoose.connection.readyState === 1;
}

// ============== SYNC CART WITH BACKEND ==============
router.post('/sync-cart', auth, async (req, res) => {
  try {
    const { cart } = req.body;

    if (!isMongoDBConnected()) {
      // If MongoDB not connected, just return success (frontend manages state)
      return res.json({
        message: 'Cart sync in offline mode',
        cart: cart || []
      });
    }

    try {
      // Update user's cart in database
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        {
          cart: cart || [],
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`✅ Cart synced for user ${req.user.userId}`);
      res.json({
        message: 'Cart synced successfully',
        cart: user.cart || []
      });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr.message);
      // Send back the cart from frontend even if sync fails
      res.json({
        message: 'Cart synced locally (DB error)',
        cart: cart || [],
        warning: 'Could not save to database'
      });
    }
  } catch (err) {
    console.error('Error syncing cart:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============== SYNC WISHLIST WITH BACKEND ==============
router.post('/sync-wishlist', auth, async (req, res) => {
  try {
    const { wishlist } = req.body;

    if (!isMongoDBConnected()) {
      // If MongoDB not connected, just return success (frontend manages state)
      return res.json({
        message: 'Wishlist sync in offline mode',
        wishlist: wishlist || []
      });
    }

    try {
      // Update user's wishlist in database
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        {
          wishlist: wishlist || [],
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`✅ Wishlist synced for user ${req.user.userId}`);
      res.json({
        message: 'Wishlist synced successfully',
        wishlist: user.wishlist || []
      });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr.message);
      // Send back the wishlist from frontend even if sync fails
      res.json({
        message: 'Wishlist synced locally (DB error)',
        wishlist: wishlist || [],
        warning: 'Could not save to database'
      });
    }
  } catch (err) {
    console.error('Error syncing wishlist:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============== GET USER CART & WISHLIST ==============
router.get('/data', auth, async (req, res) => {
  try {
    if (!isMongoDBConnected()) {
      return res.json({
        cart: [],
        wishlist: [],
        message: 'Database not connected'
      });
    }

    try {
      const user = await User.findById(req.user.userId).select('cart wishlist');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`✅ Retrieved cart and wishlist for user ${req.user.userId}`);
      res.json({
        cart: user.cart || [],
        wishlist: user.wishlist || []
      });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr.message);
      res.json({
        cart: [],
        wishlist: [],
        message: 'Could not retrieve from database'
      });
    }
  } catch (err) {
    console.error('Error retrieving user data:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============== CLEAR USER CART ==============
router.delete('/cart', auth, async (req, res) => {
  try {
    if (!isMongoDBConnected()) {
      return res.json({
        message: 'Cart cleared locally',
        cart: []
      });
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { cart: [], updatedAt: new Date() },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`✅ Cart cleared for user ${req.user.userId}`);
      res.json({ message: 'Cart cleared successfully' });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr.message);
      res.json({ message: 'Cart cleared locally (DB error)' });
    }
  } catch (err) {
    console.error('Error clearing cart:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============== CLEAR USER WISHLIST ==============
router.delete('/wishlist', auth, async (req, res) => {
  try {
    if (!isMongoDBConnected()) {
      return res.json({
        message: 'Wishlist cleared locally',
        wishlist: []
      });
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { wishlist: [], updatedAt: new Date() },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`✅ Wishlist cleared for user ${req.user.userId}`);
      res.json({ message: 'Wishlist cleared successfully' });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr.message);
      res.json({ message: 'Wishlist cleared locally (DB error)' });
    }
  } catch (err) {
    console.error('Error clearing wishlist:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
