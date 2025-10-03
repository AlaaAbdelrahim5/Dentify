const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');
const Secretary = require('../models/Secretary');
const Clinic = require('../models/Clinic');

const createSecretary = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // First, find or create a clinic for the secretary
    let clinic = await Clinic.findOne().populate('userId');
    if (!clinic) {
      console.log('⚠️  No clinic found. Please create a clinic first using create-clinic.js');
      process.exit(1);
    }

    console.log('🏥 Found clinic:', clinic.clinicName);

    // Secretary user data
    const userData = {
      email: 'secretary@gmail.com',
      password: '12345678',
      phone: '+1234567895'
    };

    const secretaryData = {
      firstName: 'Emily',
      lastName: 'Davis',
      birthDate: new Date('1992-08-10'),
      gender: 'female',
      address: {
        city: 'New York'
      },
      clinicId: clinic._id
    };

    // Check if secretary already exists
    const existingSecretary = await Secretary.findOne()
      .populate('userId')
      .then(secretary => {
        if (secretary && secretary.userId && secretary.userId.email === userData.email) {
          return secretary;
        }
        return null;
      });

    if (existingSecretary) {
      console.log('⚠️  Secretary already exists with email:', userData.email);
      console.log('Secretary ID:', existingSecretary._id);
      process.exit(0);
    }

    // Create secretary with user
    console.log('📝 Creating secretary user...');
    const result = await Secretary.createWithUser(userData, secretaryData);

    console.log('✅ Secretary created successfully!');
    console.log('📧 Email:', result.user.email);
    console.log('👤 Name:', result.secretary.firstName, result.secretary.lastName);
    console.log('👤 Gender:', result.secretary.gender);
    console.log('🎂 Birth Date:', result.secretary.birthDate.toDateString());
    console.log('📍 City:', result.secretary.address.city);
    console.log('🏥 Clinic ID:', result.secretary.clinicId);
    console.log('🆔 User ID:', result.user._id);
    console.log('🆔 Secretary ID:', result.secretary._id);
    console.log('\n🔐 Login credentials:');
    console.log('   Email:', userData.email);
    console.log('   Password:', userData.password);

    process.exit(0);
  } catch (error) {
    // Check if it's a retryable MongoDB write conflict
    if (error.code === 112 && retryCount < maxRetries) {
      console.log(`⚠️  MongoDB write conflict detected. Retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return createSecretary(retryCount + 1);
    }
    
    console.error('❌ Error creating secretary:', error);
    process.exit(1);
  }
};

// Run the script
createSecretary();