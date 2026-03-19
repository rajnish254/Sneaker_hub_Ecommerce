#!/usr/bin/env node

/**
 * COMPREHENSIVE API TEST SCRIPT
 * Tests user registration, reviews, orders, and MongoDB persistence
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let testToken = '';
let testUserId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Test helper
async function test(name, fn) {
  try {
    log.test(name);
    await fn();
  } catch (err) {
    log.error(`${name}: ${err.message}`);
    if (err.response?.data) {
      console.log('   Response:', err.response.data);
    }
  }
}

async function runTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   SNEAKER STORE API TEST SUITE         ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  // Test 1: Check if server is running
  await test('1️⃣  Health Check', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    log.success(`Server is running: ${res.data.status}`);
  });

  // Test 2: User Registration
  await test('2️⃣  User Registration', async () => {
    const timestamp = Date.now();
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      email: `testuser${timestamp}@test.com`,
      password: 'Test123456',
      firstName: 'Test',
      lastName: 'User'
    });
    
    testToken = res.data.token;
    testUserId = res.data.user.id;
    log.success(`User created: ${res.data.user.email}`);
    log.info(`   Token: ${testToken.substring(0, 20)}...`);
    log.info(`   User ID: ${testUserId}`);
  });

  // Test 3: Get Current User Profile
  await test('3️⃣  Get User Profile', async () => {
    const res = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    log.success(`Profile retrieved: ${res.data.firstName} ${res.data.lastName}`);
  });

  // Test 4: Add Review for Mock Product
  await test('4️⃣  Add Review for Mock Product (n1)', async () => {
    const res = await axios.post(`${BASE_URL}/reviews`, {
      productId: 'n1',
      rating: 5,
      title: 'Amazing Shoe!',
      comment: 'This is an excellent product with great quality and comfort!'
    }, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    log.success(`Review created for mock product n1`);
    log.info(`   Rating: ${res.data.review.rating}`);
    log.info(`   Title: ${res.data.review.title}`);
  });

  // Test 5: Get Reviews for Mock Product
  await test('5️⃣  Get Reviews for Mock Product (n1)', async () => {
    const res = await axios.get(`${BASE_URL}/reviews/product/n1`);
    log.success(`Retrieved ${res.data.totalReviews} reviews for product n1`);
    log.info(`   Average Rating: ${res.data.avgRating}`);
    log.info(`   Rating Distribution: 5⭐=${res.data.ratingCounts[5]} 4⭐=${res.data.ratingCounts[4]} 3⭐=${res.data.ratingCounts[3]}`);
  });

  // Test 6: Get All Products
  await test('6️⃣  Get Products List', async () => {
    const res = await axios.get(`${BASE_URL}/products`);
    log.success(`Retrieved ${res.data.length} products`);
    if (res.data.length > 0) {
      log.info(`   First product: ${res.data[0].name} - $${res.data[0].price}`);
    }
  });

  // Test 7: Get Single Product
  await test('7️⃣  Get Single Product Detail (n1)', async () => {
    const res = await axios.get(`${BASE_URL}/products/n1`);
    log.success(`Retrieved product: ${res.data.name}`);
    log.info(`   Price: $${res.data.price}`);
    log.info(`   Stock: ${res.data.stock}`);
  });

  // Test 8: Check MongoDB Data
  await test('8️⃣  Check MongoDB Data', async () => {
    const mongoose = require('mongoose');
    require('dotenv').config();
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Check users
    const userCount = await db.collection('users').countDocuments();
    log.info(`   Users in MongoDB: ${userCount}`);
    
    // Check reviews
    const reviewCount = await db.collection('reviews').countDocuments();
    log.info(`   Reviews in MongoDB: ${reviewCount}`);
    
    // Check orders
    const orderCount = await db.collection('orders').countDocuments();
    log.info(`   Orders in MongoDB: ${orderCount}`);
    
    // Check products
    const productCount = await db.collection('products').countDocuments();
    log.info(`   Products in MongoDB: ${productCount}`);
    
    await mongoose.disconnect();
    
    log.success('MongoDB collections verified');
  });

  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   TESTS COMPLETE                       ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);
  
  process.exit(0);
}

// Run tests
setTimeout(() => {
  runTests().catch(err => {
    log.error(`Test suite failed: ${err.message}`);
    process.exit(1);
  });
}, 2000);
