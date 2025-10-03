const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');
const Clinic = require('../models/Clinic');

const createClinic = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Clinic user data
    const userData = {
      email: 'clinic@gmail.com',
      password: '12345678',
      phone: '+1234567891'
    };

    const clinicData = {
      clinicName: 'Test Dental Clinic',
      registrationNumber: 'CLINIC-001',
      city: 'New York',
      location: '123 Main St, New York, NY 10001',
      website: 'https://testclinic.com',
      description: 'A modern dental clinic providing comprehensive dental care',
      servicesAvailable: [
        'General Consultation',
        'Teeth Cleaning',
        'Dental Filling',
        'Root Canal Treatment',
        'Teeth Whitening'
      ],
      workingHours: [
        {
          day: 'Monday',
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 'Tuesday',
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 'Wednesday',
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 'Thursday',
          startTime: '09:00',
          endTime: '17:00'
        },
        {
          day: 'Friday',
          startTime: '09:00',
          endTime: '16:00'
        }
      ],
      dentists: [],
      secretaries: []
    };

    // Check if clinic already exists
    const existingClinic = await Clinic.findOne()
      .populate('userId')
      .then(clinic => {
        if (clinic && clinic.userId && clinic.userId.email === userData.email) {
          return clinic;
        }
        return null;
      });

    if (existingClinic) {
      console.log('⚠️  Clinic already exists with email:', userData.email);
      console.log('Clinic ID:', existingClinic._id);
      process.exit(0);
    }

    // Create clinic with user
    console.log('📝 Creating clinic user...');
    const result = await Clinic.createWithUser(userData, clinicData);

    console.log('✅ Clinic created successfully!');
    console.log('📧 Email:', result.user.email);
    console.log('🏥 Clinic Name:', result.clinic.clinicName);
    console.log('📍 City:', result.clinic.city);
    console.log('🔢 Registration Number:', result.clinic.registrationNumber);
    console.log('🌐 Website:', result.clinic.website);
    console.log('⚕️  Services:', result.clinic.servicesAvailable.join(', '));
    console.log('🆔 User ID:', result.user._id);
    console.log('🆔 Clinic ID:', result.clinic._id);
    console.log('\n🔐 Login credentials:');
    console.log('   Email:', userData.email);
    console.log('   Password:', userData.password);

    process.exit(0);
  } catch (error) {
    // Check if it's a retryable MongoDB write conflict
    if (error.code === 112 && retryCount < maxRetries) {
      console.log(`⚠️  MongoDB write conflict detected. Retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return createClinic(retryCount + 1);
    }
    
    console.error('❌ Error creating clinic:', error);
    process.exit(1);
  }
};

// Run the script
createClinic();