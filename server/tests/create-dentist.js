const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');
const Dentist = require('../models/Dentist');
const Clinic = require('../models/Clinic');

const createDentist = async (retryCount = 0) => {
  const maxRetries = 3;
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // First, find or create a clinic for the dentist
    let clinic = await Clinic.findOne().populate('userId');
    if (!clinic) {
      console.log('⚠️  No clinic found. Please create a clinic first using create-clinic.js');
      process.exit(1);
    }

    console.log('🏥 Found clinic:', clinic.clinicName);

    // Dentist user data
    const userData = {
      email: 'dentist@gmail.com',
      password: '12345678',
      phone: '+1234567894'
    };

    const dentistData = {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      licenseNumber: 'DDS-12345',
      specialization: ['General Dentistry', 'Cosmetic Dentistry'],
      birthDate: new Date('1985-03-20'),
      gender: 'female',
      address: {
        city: 'New York'
      },
      clinicId: clinic._id,
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
      appointmentDuration: 45,
      socialLinks: {
        facebook: 'https://facebook.com/dr.sarah.johnson',
        instagram: '@dr_sarah_dental',
        whatsapp: '+1234567894',
        tiktok: '@dr_sarah_tiktok'
      }
    };

    // Check if dentist already exists
    const existingDentist = await Dentist.findOne()
      .populate('userId')
      .then(dentist => {
        if (dentist && dentist.userId && dentist.userId.email === userData.email) {
          return dentist;
        }
        return null;
      });

    if (existingDentist) {
      console.log('⚠️  Dentist already exists with email:', userData.email);
      console.log('Dentist ID:', existingDentist._id);
      process.exit(0);
    }

    // Create dentist with user
    console.log('📝 Creating dentist user...');
    const result = await Dentist.createWithUser(userData, dentistData);

    console.log('✅ Dentist created successfully!');
    console.log('📧 Email:', result.user.email);
    console.log('👤 Name:', result.dentist.firstName, result.dentist.lastName);
    console.log('🦷 License Number:', result.dentist.licenseNumber);
    console.log('⚕️  Specialization:', result.dentist.specialization.join(', '));
    console.log('👤 Gender:', result.dentist.gender);
    console.log('🎂 Birth Date:', result.dentist.birthDate.toDateString());
    console.log('📍 City:', result.dentist.address.city);
    console.log('🏥 Clinic ID:', result.dentist.clinicId);
    console.log('⏱️  Appointment Duration:', result.dentist.appointmentDuration + ' minutes');
    console.log('� Social Links:', Object.keys(result.dentist.socialLinks).length + ' platforms');
    console.log('🕒 Working Days:', result.dentist.workingHours.length);
    console.log('🆔 User ID:', result.user._id);
    console.log('🆔 Dentist ID:', result.dentist._id);
    console.log('\n🔐 Login credentials:');
    console.log('   Email:', userData.email);
    console.log('   Password:', userData.password);

    process.exit(0);
  } catch (error) {
    // Check if it's a retryable MongoDB write conflict
    if (error.code === 112 && retryCount < maxRetries) {
      console.log(`⚠️  MongoDB write conflict detected. Retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return createDentist(retryCount + 1);
    }
    
    console.error('❌ Error creating dentist:', error);
    process.exit(1);
  }
};

// Run the script
createDentist();