/**
 * RAZORPAY PAYMENT ROUTES
 * Complete payment integration for SneakerHub
 */

const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
});

// Helper to verify Razorpay signature
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret';
  const shasum = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  return shasum === signature;
}

/**
 * POST /api/payment/create-order
 * Creates a Razorpay order
 */
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, items, shippingAddress, email } = req.body;

    if (!amount || !items || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔄 Creating Razorpay order for amount:', amount);

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise (smallest unit)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        email: email,
        userId: req.user.userId,
        itemCount: items.length
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    console.log('✅ Razorpay order created:', razorpayOrder.id);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      email: email,
      name: 'SneakerHub',
      description: `Order for ${items.length} items`,
      image: '/favicon.ico'
    });
  } catch (err) {
    console.error('❌ Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment order' });
  }
});

/**
 * POST /api/payment/verify-payment
 * Verifies payment and creates order in database
 */
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, items, shippingAddress, totalAmount } = req.body;

    console.log('🔐 Verifying payment signature...');

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      console.error('❌ Invalid payment signature');
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    console.log('✅ Payment signature verified successfully');

    // Create order in database
    const orderData = {
      userId: req.user.userId,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: 'razorpay',
      paymentId: razorpayPaymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentStatus: 'success',
      status: 'confirmed',
      createdAt: new Date()
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    console.log('✅ Order created successfully:', savedOrder._id);
    console.log('📦 Order Details:', {
      orderId: savedOrder._id,
      itemsCount: savedOrder.items.length,
      totalAmount: savedOrder.totalAmount,
      paymentStatus: savedOrder.paymentStatus
    });

    res.json({
      success: true,
      message: 'Payment verified and order created successfully',
      orderId: savedOrder._id,
      paymentId: razorpayPaymentId
    });
  } catch (err) {
    console.error('❌ Error verifying payment:', err);
    res.status(500).json({ error: err.message || 'Failed to verify payment' });
  }
});

/**
 * GET /api/payment/status/:orderId
 * Get payment and order status
 */
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
