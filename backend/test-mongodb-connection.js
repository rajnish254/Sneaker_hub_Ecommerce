#!/usr/bin/env node

/**
 * MONGODB CONNECTION TEST SCRIPT
 * Run this to diagnose MongoDB connection issues
 */

const mongoose = require('mongoose');
require('dotenv').config();

console.log('\n🔍 MongoDB Connection Diagnostic Tool\n');
console.log('======================================\n');

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not set in .env file');
  console.log('   Please add: MONGODB_URI=mongodb://localhost:27017/sneaker-store\n');
  process.exit(1);
}

console.log('📍 Configured MongoDB URI:', process.env.MONGODB_URI);
console.log('⏳ Attempting to connect to MongoDB...\n');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(async () => {
  console.log('✅ MongoDB Connection SUCCESSFUL!\n');
  
  // Test database operations
  try {
    const admin = mongoose.connection.db.admin();
    const status = await admin.serverStatus();
    console.log('📊 MongoDB Server Status:');
    console.log(`   - Version: ${status.version}`);
    console.log(`   - Uptime: ${status.uptime} seconds`);
    console.log(`   - Connections: ${status.connections.current} current\n`);
    
    // List databases
    const databases = await admin.listDatabases();
    const dbNames = databases.databases.map(db => db.name);
    console.log('📚 Available Databases:');
    dbNames.forEach(db => console.log(`   - ${db}`));
    
    // Check collections in sneaker-store
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('\n📦 Collections in "sneaker-store" database:');
    if (collections.length === 0) {
      console.log('   (No collections exist yet - they will be created when data is saved)');
    } else {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name} (${count} documents)`);
      }
    }
    
    console.log('\n✅ MongoDB is working correctly!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error testing MongoDB:', err.message);
    process.exit(1);
  }
})
.catch((err) => {
  console.error('❌ MongoDB Connection FAILED!\n');
  console.error('Error Details:');
  console.error(`   - ${err.message}\n`);
  
  console.log('Troubleshooting Tips:');
  console.log('   1. Make sure MongoDB is running:');
  console.log('      - On Windows: Check if MongoDB service is running');
  console.log('      - Run: mongod from command line to start it\n');
  console.log('   2. Check if MongoDB is accessible:');
  console.log('      - Verify localhost:27017 is accessible\n');
  console.log('   3. Check your .env file:');
  console.log('      - MONGODB_URI should be set correctly\n');
  
  process.exit(1);
});
