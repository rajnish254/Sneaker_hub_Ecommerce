/**
 * SNEAKER STORE - BACKEND SERVER
 * Node.js + Express API Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const app = express();

// ============== SECURITY MIDDLEWARE ==============
app.use(helmet()); // Add security headers

// ============== MIDDLEWARE ==============
// Configure CORS for production and development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://sneaker-store-lake-nine.vercel.app', // Vercel frontend
  'https://sneaker-store-frontend-navy.vercel.app', // Alternative Vercel frontend
  process.env.FRONTEND_URL, // Render/other frontend URL
  process.env.CORS_ORIGIN // Alternative environment variable
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============== DATABASE CONNECTION ==============
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.log('⚠️  MongoDB connection failed:', err.message);
    console.log('⚠️  Check if MongoDB service is running on localhost:27017');
  });

  // Listen for connection events
  mongoose.connection.on('connected', () => {
    console.log('📡 MongoDB connection established and ready');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.log('❌ MongoDB connection error:', err.message);
  });
} else {
  console.log('⚠️  MONGODB_URI not set in .env - Configure it to save data to MongoDB');
}

// ============== ROUTES ==============
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/google-auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/reviews', require('./routes/reviews'));

// ============== HEALTH CHECK ==============
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: '✅ Server is running',
    timestamp: new Date().toISOString(),
    mongodb: {
      status: states[mongoState],
      connected: mongoState === 1,
      readyState: mongoState,
      uri: process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============== DETAILED HEALTH CHECK ==============
app.get('/api/health/detailed', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    server: {
      status: '✅ Running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5000
    },
    mongodb: {
      status: states[mongoState],
      connected: mongoState === 1,
      readyState: mongoState,
      configured: !!process.env.MONGODB_URI,
      uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'Not configured'
    },
    api: {
      auth: '✅ Available',
      products: '✅ Available',
      orders: '✅ Available',
      checkout: '✅ Available',
      reviews: '✅ Available',
      cart: '✅ Available'
    },
    notes: mongoState === 1 
      ? '✅ All data will be saved to MongoDB' 
      : '⚠️  MongoDB not connected - data will be saved to in-memory storage only'
  });
});

// ============== TEST MONGODB CONNECTION ==============
app.get('/api/test/mongodb', async (req, res) => {
  try {
    const mongoState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Try to verify connection by accessing MongoDB admin database
    if (mongoState === 1) {
      try {
        const admin = mongoose.connection.db.admin();
        const status = await admin.command({ ping: 1 });
        console.log('✅ MongoDB ping successful');
        res.json({
          mongodbConnected: true,
          status: states[mongoState],
          ping: 'success',
          message: '✅ MongoDB is connected and responding'
        });
      } catch (pingErr) {
        console.error('❌ MongoDB ping failed:', pingErr.message);
        res.json({
          mongodbConnected: true,
          status: states[mongoState],
          ping: 'failed',
          error: pingErr.message,
          message: '⚠️  MongoDB connection exists but ping failed'
        });
      }
    } else {
      res.json({
        mongodbConnected: false,
        status: states[mongoState],
        message: `⚠️  MongoDB is ${states[mongoState]}`
      });
    }
  } catch (err) {
    console.error('❌ Test MongoDB error:', err.message);
    res.status(500).json({
      error: err.message,
      message: '❌ Error testing MongoDB connection'
    });
  }
});

// ============== ERROR HANDLING ==============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// ============== SERVER START ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
