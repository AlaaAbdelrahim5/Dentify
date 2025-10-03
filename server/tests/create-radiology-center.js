const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');
const RadiologyCenter = require('../models/RadiologyCenter');

const createRadiologyCenter = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // RadiologyCenter user data
    const userData = {
      email: 'radiology@gmail.com',
      password: '12345678',
      phone: '+1234567892'
    };

    const radiologyCenterData = {
      centerName: 'Advanced Imaging Center',
      registrationNumber: 'RAD-001',
      website: 'https://advancedimaging.com',
      city: 'Los Angeles',
      location: '456 Medical Blvd, Los Angeles, CA 90210',
      description: 'State-of-the-art radiology center with latest imaging technology',
      workingHours: [
        {
          day: 'Monday',
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          day: 'Tuesday',
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          day: 'Wednesday',
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          day: 'Thursday',
          startTime: '08:00',
          endTime: '18:00'
        },
        {
          day: 'Friday',
          startTime: '08:00',
          endTime: '16:00'
        },
        {
          day: 'Saturday',
          startTime: '09:00',
          endTime: '14:00'
        }
      ],
      supportedTypes: [
        'Panoramic X-Ray',
        'CBCT (Cone Beam CT)',
        'Digital X-Ray',
        '3D Imaging',
        'Cephalometric X-Ray',
        'Intraoral X-Ray'
      ]
    };

    // Check if radiology center already exists
    const existingCenter = await RadiologyCenter.findOne()
      .populate('userId')
      .then(center => {
        if (center && center.userId && center.userId.email === userData.email) {
          return center;
        }
        return null;
      });

    if (existingCenter) {
      console.log('⚠️  Radiology Center already exists with email:', userData.email);
      console.log('Center ID:', existingCenter._id);
      process.exit(0);
    }

    // Create radiology center with user
    console.log('📝 Creating radiology center user...');
    const result = await RadiologyCenter.createWithUser(userData, radiologyCenterData);

    console.log('✅ Radiology Center created successfully!');
    console.log('📧 Email:', result.user.email);
    console.log('🏥 Center Name:', result.center.centerName);
    console.log('📍 City:', result.center.city);
    console.log('🔢 Registration Number:', result.center.registrationNumber);
    console.log('🌐 Website:', result.center.website);
    console.log('📡 Supported Types:', result.center.supportedTypes.join(', '));
    console.log('🕒 Working Hours:', result.center.workingHours.length + ' days');
    console.log('🆔 User ID:', result.user._id);
    console.log('🆔 Center ID:', result.center._id);
    console.log('\n🔐 Login credentials:');
    console.log('   Email:', userData.email);
    console.log('   Password:', userData.password);

    process.exit(0);
  } catch (error) {
    // Check if it's a retryable MongoDB write conflict
    if (error.code === 112 && retryCount < maxRetries) {
      console.log(`⚠️  MongoDB write conflict detected. Retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return createRadiologyCenter(retryCount + 1);
    }
    
    console.error('❌ Error creating radiology center:', error);
    process.exit(1);
  }
};

// Run the script
createRadiologyCenter();