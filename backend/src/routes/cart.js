/**
 * CART ROUTES
 */

const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// ============== GET CART ==============
router.get('/', auth, async (req, res) => {
  try {
    // Get user's cart from database or return from frontend
    // For demo: return empty cart
    res.json({
      message: 'Cart managed on frontend',
      items: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============== UPDATE CART ==============
router.post('/', auth, async (req, res) => {
  try {
    const { items } = req.body;
    
    // TODO: Validate items
    // TODO: Save to database if needed
    
    res.json({ message: 'Cart updated', items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
