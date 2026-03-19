/**
 * CHECKOUT ROUTES
 * Razorpay and Stripe payment integration
 */

const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const inMemory = require('../utils/inMemoryStorage');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const Razorpay = require('razorpay');

const router = express.Router();

// Helper function to check MongoDB connection
function isMongoDBConnected() {
  return mongoose.connection.readyState === 1; // 1 = connected
}

// Helper function to save order (with MongoDB fallback)
async function saveOrder(orderData) {
  const mongoConnected = isMongoDBConnected();
  
  if (mongoConnected) {
    try {
      console.log('📝 Attempting to save order to MongoDB...');
      const order = new Order(orderData);
      const savedOrder = await order.save();
      console.log('✅ Order saved to MongoDB successfully:', savedOrder._id);
      console.log('📦 Order Data:', {
        userId: savedOrder.userId,
        itemsCount: savedOrder.items.length,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status
      });
      return savedOrder;
    } catch (err) {
      console.error('❌ MongoDB save failed:', err.message);
      console.error('Error details:', err);
      console.log('⚠️  Falling back to in-memory storage');
      // Fallback to in-memory storage
      const inMemoryOrder = { ...orderData, _id: 'order_' + Date.now() };
      console.log('💾 Order saved to in-memory storage:', inMemoryOrder._id);
      return inMemoryOrder;
    }
  } else {
    console.log('⚠️  MongoDB not connected, saving to in-memory storage');
    const inMemoryOrder = { ...orderData, _id: 'order_' + Date.now() };
    console.log('💾 Order saved to in-memory storage:', inMemoryOrder._id);
    return inMemoryOrder;
  }
}

// Initialize Razorpay
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Initialize Stripe only if API key exists
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// ============== CREATE PAYMENT INTENT ==============
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, items, shippingAddress } = req.body;

    // Prefer Razorpay if available
    if (razorpay) {
      console.log('💳 Creating Razorpay order');
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          userId: req.user.userId,
          itemsCount: items.length,
        }
      });

      console.log('✅ Razorpay order created:', razorpayOrder.id);
      return res.json({
        razorpay_order_id: razorpayOrder.id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
        paymentMethod: 'razorpay'
      });
    }

    // Fallback to Stripe if Razorpay not configured
    if (stripe) {
      console.log('💳 Creating Stripe payment intent');
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'inr',
        metadata: {
          userId: req.user.userId
        }
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentMethod: 'stripe'
      });
    }

    // If neither Razorpay nor Stripe configured, use mock mode
    console.log('⚠️  No payment gateway configured, using mock payment mode');
    return res.json({ 
      mockMode: true,
      paymentMethod: 'mock',
      message: 'Mock payment mode - no actual charge will be made'
    });
  } catch (err) {
    console.error('Payment intent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============== CONFIRM PAYMENT & CREATE ORDER ==============
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const mongoConnected = isMongoDBConnected();
    console.log('📊 MongoDB Connection Status:', mongoConnected ? '✅ Connected' : '❌ Disconnected');
    
    const { paymentIntentId, razorpayPaymentId, razorpayOrderId, razorpaySignature, items, shippingAddress, totalAmount } = req.body;

    console.log('🔄 Processing order for user:', req.user.userId);

    let paymentMethod = 'unknown';
    let isPaymentValid = false;

    // Verify Razorpay payment
    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      if (!razorpay) {
        return res.status(400).json({ error: 'Razorpay is not configured' });
      }

      try {
        // Verify payment signature
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        hmac.update(body);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpaySignature) {
          console.log('✅ Razorpay payment verified successfully');
          isPaymentValid = true;
          paymentMethod = 'razorpay';
        } else {
          return res.status(400).json({ error: 'Invalid Razorpay signature' });
        }
      } catch (err) {
        console.error('Razorpay verification error:', err);
        return res.status(400).json({ error: 'Failed to verify Razorpay payment' });
      }
    }
    // Verify Stripe payment
    else if (paymentIntentId && stripe) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Stripe payment verified successfully');
          isPaymentValid = true;
          paymentMethod = 'stripe';
        } else {
          return res.status(400).json({ error: 'Stripe payment not successful' });
        }
      } catch (err) {
        console.error('Stripe verification error:', err);
        return res.status(400).json({ error: 'Failed to verify Stripe payment' });
      }
    }
    // Mock payment mode
    else if (paymentIntentId && paymentIntentId.startsWith('mock_payment_')) {
      console.log('✅ Using mock payment mode');
      isPaymentValid = true;
      paymentMethod = 'mock';
    }
    else {
      return res.status(400).json({ error: 'No valid payment verification data provided' });
    }

    if (!isPaymentValid) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Prepare order data
    const orderData = {
      userId: req.user.userId,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod,
      paymentId: razorpayPaymentId || paymentIntentId,
      status: 'confirmed',
      createdAt: new Date()
    };

    // Try to save order (MongoDB with fallback to in-memory)
    const order = await saveOrder(orderData);
    
    // Also save to in-memory storage for retrieval
    if (inMemory && inMemory.createOrder) {
      await inMemory.createOrder(orderData);
    }
    
    if (!order) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    console.log('✅ Order created successfully:', order._id);

    // Send order confirmation email
    try {
      console.log('📧 Sending order confirmation email to:', shippingAddress.email);
      const emailResult = await sendOrderConfirmationEmail(order, shippingAddress.email);
      if (emailResult.success) {
        console.log('✅ Order confirmation email sent successfully');
      } else {
        console.warn('⚠️  Failed to send email but order was created:', emailResult.error);
      }
    } catch (emailError) {
      console.error('⚠️  Error sending confirmation email:', emailError.message);
      // Continue - don't fail the order creation if email fails
    }

    res.json({
      message: 'Order created successfully',
      orderId: order._id
    });
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
