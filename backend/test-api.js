/**
 * TEST SCRIPT - Test Backend APIs
 */

const http = require('http');

function request(method, path, data) {
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
            body: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body
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
  console.log('\n🧪 TESTING BACKEND APIs\n');

  try {
    // Test 1: Register
    console.log('1️⃣  Testing SIGNUP...');
    const signup = await request('POST', '/api/auth/register', {
      email: 'john@test.com',
      password: 'test123456',
      firstName: 'John',
      lastName: 'Doe'
    });
    console.log('Status:', signup.status);
    console.log('Response:', JSON.stringify(signup.body, null, 2));
    const token = signup.body.token;

    // Test 2: Login
    console.log('\n2️⃣  Testing LOGIN...');
    const login = await request('POST', '/api/auth/login', {
      email: 'john@test.com',
      password: 'test123456'
    });
    console.log('Status:', login.status);
    console.log('Response:', JSON.stringify(login.body, null, 2));

    // Test 3: Get Profile
    console.log('\n3️⃣  Testing GET PROFILE...');
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const profile = await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            body: JSON.parse(body)
          });
        });
      });
      req.end();
    });

    console.log('Status:', profile.status);
    console.log('Response:', JSON.stringify(profile.body, null, 2));

    // Test 4: Health Check
    console.log('\n4️⃣  Testing HEALTH CHECK...');
    const health = await request('GET', '/api/health');
    console.log('Status:', health.status);
    console.log('Response:', JSON.stringify(health.body, null, 2));

    console.log('\n✅ All tests completed!');
  } catch (err) {
    console.error('❌ Test Error:', err);
  }

  process.exit(0);
}

runTests();
