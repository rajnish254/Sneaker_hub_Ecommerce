/**
 * ORDERS ROUTES
 */

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const inMemory = require('../utils/inMemoryStorage');
const { sendOrderStatusUpdateEmail } = require('../utils/emailService');

const router = express.Router();

// Helper function to check MongoDB connection
function isMongoDBConnected() {
  const connected = mongoose.connection.readyState === 1;
  console.log(`📊 MongoDB Check in orders.js: ${connected ? '✅ Connected' : '❌ Not connected'}`);
  return connected;
}

// ============== GET USER'S ORDERS ==============
router.get('/', auth, async (req, res) => {
  try {
    const mongoConnected = isMongoDBConnected();
    let allOrders = [];
    
    if (mongoConnected) {
      try {
        allOrders = await Order.find({ userId: req.user.userId });
        console.log(`✅ Retrieved ${allOrders.length} orders from MongoDB`);
      } catch (mongoErr) {
        console.error('⚠️  MongoDB query failed:', mongoErr.message);
        // Fallback to in-memory orders
        if (inMemory && inMemory.getUserOrders) {
          allOrders = await inMemory.getUserOrders(req.user.userId);
        }
      }
    } else {
      console.log('⚠️  MongoDB not connected, using in-memory orders');
      if (inMemory && inMemory.getUserOrders) {
        allOrders = await inMemory.getUserOrders(req.user.userId);
      }
    }
    
    // Return in the format the frontend expects
    res.json({ orders: allOrders });
  } catch (err) {
    console.error('❌ Error fetching orders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============== GET SINGLE ORDER ==============
router.get('/:id', auth, async (req, res) => {
  try {
    const mongoConnected = isMongoDBConnected();
    
    if (mongoConnected) {
      try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
          console.log('⚠️  Order not found in MongoDB');
          return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user owns this order
        if (order.userId.toString() !== req.user.userId) {
          console.log('❌ Unauthorized access to order');
          return res.status(403).json({ error: 'Unauthorized' });
        }

        console.log(`✅ Retrieved order ${req.params.id} from MongoDB`);
        res.json(order);
      } catch (mongoErr) {
        console.error('⚠️  MongoDB query failed:', mongoErr.message);
        res.status(500).json({ error: 'Failed to fetch order' });
      }
    } else {
      console.log('⚠️  MongoDB not connected');
      res.status(503).json({ error: 'Service temporarily unavailable' });
    }
  } catch (err) {
    console.error('❌ Error fetching order:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============== UPDATE ORDER STATUS ==============
router.put('/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const mongoConnected = isMongoDBConnected();

    if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (mongoConnected) {
      try {
        const order = await Order.findByIdAndUpdate(
          req.params.id,
          { 
            status,
            trackingNumber: trackingNumber || undefined,
            updatedAt: new Date()
          },
          { new: true }
        );

        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }

        // Send status update email
        try {
          const emailResult = await sendOrderStatusUpdateEmail(
            order.shippingAddress.email,
            order,
            status
          );
          
          if (emailResult.success) {
            console.log('✅ Order status update email sent for order:', req.params.id);
          } else {
            console.warn('⚠️  Failed to send status update email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('⚠️  Error sending status update email:', emailError.message);
          // Continue - don't fail the request if email fails
        }

        console.log(`✅ Order ${req.params.id} status updated to "${status}"`);
        res.json({
          message: 'Order status updated successfully',
          order
        });
      } catch (mongoErr) {
        console.error('❌ MongoDB update failed:', mongoErr.message);
        res.status(500).json({ error: 'Failed to update order' });
      }
    } else {
      // In-memory update
      if (inMemory && inMemory.updateOrderStatus) {
        const updatedOrder = await inMemory.updateOrderStatus(req.params.id, status, trackingNumber);
        if (updatedOrder) {
          res.json({
            message: 'Order status updated successfully',
            order: updatedOrder
          });
        } else {
          res.status(404).json({ error: 'Order not found' });
        }
      } else {
        res.status(503).json({ error: 'Service temporarily unavailable' });
      }
    }
  } catch (err) {
    console.error('❌ Error updating order status:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============== SEND PROMOTIONAL EMAIL ==============
router.post('/email/promotional', async (req, res) => {
  try {
    const { email, firstName, title, discount, code, expiryDate, description, buttonText, buttonLink } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { sendPromotionalEmail } = require('../utils/emailService');
    
    const promoData = {
      title: title || 'Exclusive Offer Just for You!',
      discount: discount || '50% OFF',
      code,
      expiryDate,
      description: description || 'We have a special offer just for you!',
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || 'http://localhost:3000/products'
    };

    const emailResult = await sendPromotionalEmail(
      email,
      firstName || 'Valued Customer',
      promoData
    );

    if (emailResult.success) {
      res.json({ 
        message: 'Promotional email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({ error: emailResult.error });
    }
  } catch (err) {
    console.error('❌ Error sending promotional email:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
