require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 Testing MongoDB Atlas Connection...\n');
console.log('📍 Connection String:', process.env.MONGODB_URI);
console.log('🔐 Credentials:', {
  database: 'sneaker-store',
  username: 'sneaker-admin',
  host: 'sneaker-storedb.e03l2ix.mongodb.net'
});

const connectDB = async () => {
  try {
    console.log('\n⏳ Attempting to connect...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ Connection Successful!');
    console.log('📊 MongoDB Details:');
    console.log(`   - Host: ${conn.connection.host}`);
    console.log(`   - Database: ${conn.connection.db.databaseName}`);
    console.log(`   - State: Connected`);
    
    // Try a simple operation
    console.log('\n🔍 Testing database operation...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections in database`);
    
    console.log('\n✨ All tests passed! MongoDB Atlas is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error('\n📋 Error Details:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('   1. Verify MongoDB Atlas cluster is ACTIVE (not paused)');
    console.error('   2. Check database user exists: sneaker-admin');
    console.error('   3. Verify password is correct: Cartman890');
    console.error('   4. Check Network Access: 0.0.0.0/0 should be in whitelist');
    console.error('   5. Try pinging: nslookup sneaker-storedb.e03l2ix.mongodb.net');
    console.error('   6. Check firewall/VPN blocking port 27017');
    
    process.exit(1);
  }
};

connectDB();
