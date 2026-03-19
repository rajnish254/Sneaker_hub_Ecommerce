/**
 * TEST SCRIPT - Data Persistence Check
 * Tests if reviews and orders are saved to MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Review = require('./src/models/Review');
const Order = require('./src/models/Order');
const User = require('./src/models/User');

async function testDataPersistence() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sneaker-store');
    console.log('✅ MongoDB connected');

    // Get or create a test user
    console.log('\n👤 Finding test user...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('   Creating test user...');
      testUser = new User({
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'Test',
        lastName: 'User'
      });
      await testUser.save();
      console.log('   ✅ Test user created');
    }
    const userName = `${testUser.firstName || ''} ${testUser.lastName || ''}`.trim() || 'Anonymous';
    console.log(`   ✅ Using user: ${userName} (ID: ${testUser._id})`);

    // Count existing reviews
    console.log('\n📝 REVIEWS CHECK:');
    let reviewCount = await Review.countDocuments();
    console.log(`   Existing reviews: ${reviewCount}`);

    // Create a test review
    console.log('   Creating test review...');
    const testReview = new Review({
      productId: 'n1', // Mock product ID
      userId: testUser._id,
      userName: userName,
      rating: 5,
      title: 'Amazing product!',
      comment: 'This is a test review to verify MongoDB persistence is working correctly.'
    });
    await testReview.save();
    console.log(`   ✅ Review created: ${testReview._id}`);

    // Verify review was saved
    const savedReview = await Review.findById(testReview._id);
    if (savedReview) {
      console.log('   ✅ Review verified in MongoDB');
      console.log(`      - Product: ${savedReview.productId}`);
      console.log(`      - Rating: ${savedReview.rating}/5`);
      console.log(`      - Title: ${savedReview.title}`);
    } else {
      console.log('   ❌ Review NOT found in MongoDB');
    }

    // Count existing orders
    console.log('\n📦 ORDERS CHECK:');
    let orderCount = await Order.countDocuments();
    console.log(`   Existing orders: ${orderCount}`);

    // Create a test order
    console.log('   Creating test order...');
    const testOrder = new Order({
      userId: testUser._id,
      items: [
        {
          productId: 'n1',
          name: 'Test Sneaker',
          price: 5999,
          quantity: 1,
          size: 10
        }
      ],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        address: '123 Test Street',
        city: 'Test City',
        pincode: '123456',
        phone: '9876543210'
      },
      totalAmount: 5999,
      paymentMethod: 'stripe',
      paymentId: 'test_payment_12345',
      status: 'confirmed'
    });
    await testOrder.save();
    console.log(`   ✅ Order created: ${testOrder._id}`);

    // Verify order was saved
    const savedOrder = await Order.findById(testOrder._id);
    if (savedOrder) {
      console.log('   ✅ Order verified in MongoDB');
      console.log(`      - Items: ${savedOrder.items.length}`);
      console.log(`      - Total: ₹${savedOrder.totalAmount}`);
      console.log(`      - Status: ${savedOrder.status}`);
      console.log(`      - City: ${savedOrder.shippingAddress.city}`);
    } else {
      console.log('   ❌ Order NOT found in MongoDB');
    }

    // Final count
    console.log('\n📊 FINAL COUNTS:');
    const finalReviewCount = await Review.countDocuments();
    const finalOrderCount = await Order.countDocuments();
    console.log(`   Total reviews in database: ${finalReviewCount}`);
    console.log(`   Total orders in database: ${finalOrderCount}`);

    console.log('\n✅ TEST COMPLETE - Data persistence is working!');
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run test
testDataPersistence();
