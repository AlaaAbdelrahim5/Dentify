const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Admin data
    const userData = {
      email: 'admin@gmail.com',
      password: '12345678',
      phone: '+1234567890' // Required field
    };

    const adminData = {
      firstName: 'System',
      lastName: 'Administrator',
      gender: 'male'
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne()
      .populate('userId')
      .then(admin => {
        if (admin && admin.userId && admin.userId.email === userData.email) {
          return admin;
        }
        return null;
      });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email:', userData.email);
      console.log('Admin ID:', existingAdmin._id);
      process.exit(0);
    }

    // Create admin with user
    console.log('📝 Creating admin user...');
    const result = await Admin.createWithUser(userData, adminData);

    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', result.user.email);
    console.log('👤 Name:', result.admin.firstName, result.admin.lastName);
    console.log('🆔 User ID:', result.user._id);
    console.log('🆔 Admin ID:', result.admin._id);
    console.log('\n🔐 Login credentials:');
    console.log('   Email:', userData.email);
    console.log('   Password:', userData.password);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();
