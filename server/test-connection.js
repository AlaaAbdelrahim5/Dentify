require('dotenv').config();
const { connectDB } = require('./config/database');
const Secretary = require('./models/Secretary');
const User = require('./models/User');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    await connectDB();
    
    console.log('✅ Database connected successfully!');
    console.log('📊 Testing Secretary model...');
    
    // Test if we can query the Secretary collection
    const secretaryCount = await Secretary.countDocuments();
    console.log(`📋 Found ${secretaryCount} secretaries in database`);
    
    // Test if we can query the User collection
    const userCount = await User.countDocuments();
    console.log(`👥 Found ${userCount} users in database`);
    
    console.log('✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();