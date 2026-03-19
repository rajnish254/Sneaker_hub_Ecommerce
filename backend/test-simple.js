#!/usr/bin/env node

/**
 * Simple API Test Script
 */

const http = require('http');

let testCount = 0;
let successCount = 0;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n✅  TESTING SNEAKER STORE BACKEND\n');

  // Test 1: Health Check
  console.log('1️⃣  Testing Health Check...');
  testCount++;
  try {
    const res = await makeRequest('GET', '/api/health');
    if (res.status === 200) {
      console.log(`   ✅ Server is running: ${res.data.status}\n`);
      successCount++;
    } else {
      console.log(`   ❌ Unexpected status: ${res.status}\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test 2: Register User
  console.log('2️⃣  Testing User Registration...');
  testCount++;
  let authToken = '';
  let userId = '';
  try {
    const timestamp = Date.now();
    const res = await makeRequest('POST', '/api/auth/register', {
      email: `test${timestamp}@example.com`,
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (res.status === 201 && res.data.token) {
      authToken = res.data.token;
      userId = res.data.user.id;
      console.log(`   ✅ User registered: ${res.data.user.email}`);
      console.log(`   ✅ Token received: ${authToken.substring(0, 20)}...\n`);
      successCount++;
    } else {
      console.log(`   ❌ Registration failed: ${res.data.error || res.status}\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test 3: Get Products
  console.log('3️⃣  Testing Get Products...');
  testCount++;
  try {
    const res = await makeRequest('GET', '/api/products');
    if (res.status === 200 && Array.isArray(res.data)) {
      console.log(`   ✅ Retrieved ${res.data.length} products`);
      if (res.data.length > 0) {
        console.log(`   ✅ First product: ${res.data[0].name} - $${res.data[0].price}\n`);
      }
      successCount++;
    } else {
      console.log(`   ❌ Failed to get products\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test 4: Get Single Product
  console.log('4️⃣  Testing Get Single Product (n1)...');
  testCount++;
  try {
    const res = await makeRequest('GET', '/api/products/n1');
    if (res.status === 200 && res.data.name) {
      console.log(`   ✅ Product: ${res.data.name}`);
      console.log(`   ✅ Price: $${res.data.price}\n`);
      successCount++;
    } else {
      console.log(`   ❌ Failed to get product\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test 5: Add Review
  console.log('5️⃣  Testing Add Review for Mock Product...');
  testCount++;
  if (authToken) {
    try {
      const req = new Promise((resolve) => {
        const options = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/reviews',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        };

        const httpReq = http.request(options, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: JSON.parse(body)
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                data: body
              });
            }
          });
        });

        const reviewData = {
          productId: 'n1',
          rating: 5,
          title: 'Amazing Product!',
          comment: 'This is an excellent product with great quality and very comfortable!'
        };

        httpReq.write(JSON.stringify(reviewData));
        httpReq.end();
      });

      const res = await req;
      if (res.status === 201) {
        console.log(`   ✅ Review created for product n1`);
        console.log(`   ✅ Rating: ${res.data.review.rating} stars\n`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to create review: ${res.data.error || res.status}\n`);
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }
  }

  // Test 6: Get Reviews
  console.log('6️⃣  Testing Get Reviews for Product...');
  testCount++;
  try {
    const res = await makeRequest('GET', '/api/reviews/product/n1');
    if (res.status === 200) {
      console.log(`   ✅ Retrieved ${res.data.totalReviews} reviews`);
      console.log(`   ✅ Average rating: ${res.data.avgRating} stars\n`);
      successCount++;
    } else {
      console.log(`   ❌ Failed to get reviews\n`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Test 7: Check MongoDB Data
  console.log('7️⃣  Checking MongoDB Data...');
  testCount++;
  try {
    const mongoose = require('mongoose');
    require('dotenv').config();
    
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    
    const db = mongoose.connection.db;
    const userCount = await db.collection('users').countDocuments();
    const reviewCount = await db.collection('reviews').countDocuments();
    const orderCount = await db.collection('orders').countDocuments();
    const productCount = await db.collection('products').countDocuments();
    
    await mongoose.disconnect();
    
    console.log(`   ✅ Users in MongoDB: ${userCount}`);
    console.log(`   ✅ Reviews in MongoDB: ${reviewCount}`);
    console.log(`   ✅ Orders in MongoDB: ${orderCount}`);
    console.log(`   ✅ Products in MongoDB: ${productCount}\n`);
    successCount++;
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}\n`);
  }

  // Summary
  console.log('═════════════════════════════════════════');
  console.log(`📊 TEST SUMMARY: ${successCount}/${testCount} tests passed`);
  console.log('═════════════════════════════════════════\n');
  
  process.exit(successCount === testCount ? 0 : 1);
}

runTests();
