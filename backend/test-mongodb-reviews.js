/**
 * TEST MONGODB REVIEWS - Direct MongoDB Test
 * Inserts a test product and reviews it via API
 */

const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

// Models
const Product = require('./src/models/Product');
const Review = require('./src/models/Review');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 TESTING MONGODB REVIEWS WITH REAL PRODUCTS\n');
  let passed = 0;
  let failed = 0;

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sneaker-store');
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create a test product in MongoDB
    console.log('1️⃣  Creating test product in MongoDB...');
    const testProduct = await Product.create({
      name: 'Test Review Product',
      brand: 'Test Brand',
      price: 9999,
      originalPrice: 12999,
      image: 'https://example.com/test.jpg',
      description: 'Product for testing reviews',
      category: 'Running',
      gender: 'Unisex',
      colors: ['Black'],
      sizes: [9, 10],
      stock: 50,
      rating: 0
    });
    console.log(`   ✅ Product created with ID: ${testProduct._id}`);
    passed++;

    // Test 2: Register a test user via API
    console.log('\n2️⃣  Registering test user...');
    const userEmail = `reviewer${Date.now()}@test.com`;
    const registerRes = await request('POST', '/auth/register', {
      firstName: 'Review',
      email: userEmail,
      password: 'Test@1234'
    });

    if (registerRes.status !== 201) {
      console.log(`   ❌ Failed to register: ${registerRes.data.error}`);
      failed++;
      throw new Error('User registration failed');
    }

    const token = registerRes.data.token;
    const userId = registerRes.data.user._id || registerRes.data.userId;
    console.log(`   ✅ User registered with ID: ${userId}`);
    passed++;

    // Test 3: Create a review for the test product via API
    console.log(`\n3️⃣  Creating review for test product ${testProduct._id}...`);
    const reviewRes = await request('POST', '/reviews', {
      productId: testProduct._id.toString(),
      rating: 5,
      title: 'Excellent Test Product!',
      comment: 'This is a test review to verify MongoDB persistence. Amazing quality!'
    }, token);

    if (reviewRes.status !== 201) {
      console.log(`   ❌ Failed to create review: ${reviewRes.data.error}`);
      console.log(`   Response:`, reviewRes.data);
      failed++;
    } else {
      console.log(`   ✅ Review created via API`);
      passed++;
    }

    // Test 4: Check if review was saved to MongoDB
    console.log(`\n4️⃣  Checking if review saved to MongoDB...`);
    const mongoReview = await Review.findOne({
      productId: testProduct._id
    });

    if (mongoReview) {
      console.log(`   ✅ Review FOUND in MongoDB!`);
      console.log(`      ID: ${mongoReview._id}`);
      console.log(`      Rating: ${mongoReview.rating}/5`);
      console.log(`      Title: ${mongoReview.title}`);
      passed++;
    } else {
      console.log(`   ❌ Review NOT found in MongoDB (may be in in-memory storage)`);
      failed++;
    }

    // Test 5: Verify via API GET endpoint
    console.log(`\n5️⃣  Retrieving reviews via API...`);
    const getRes = await request('GET', `/reviews/product/${testProduct._id}`);

    if (getRes.status === 200) {
      console.log(`   ✅ Retrieved ${getRes.data.reviews.length} review(s)`);
      console.log(`   📊 Average rating: ${getRes.data.avgRating} stars`);
      if (getRes.data.reviews.length > 0) {
        console.log(`   💬 Review: "${getRes.data.reviews[0].title}"`);
      }
      passed++;
    } else {
      console.log(`   ❌ Failed to retrieve reviews`);
      failed++;
    }

    // Test 6: Clean up
    console.log(`\n6️⃣  Cleaning up test data...`);
    await Product.deleteOne({ _id: testProduct._id });
    await Review.deleteMany({ productId: testProduct._id });
    console.log(`   ✅ Test product and reviews cleaned up`);
    passed++;

  } catch (err) {
    console.error('❌ Test error:', err.message);
    failed++;
  } finally {
    // Disconnect
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 TEST SUMMARY: ${passed}/${passed + failed} tests passed`);
  console.log('='.repeat(50) + '\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
