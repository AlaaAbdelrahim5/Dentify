const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');
const Patient = require('../models/Patient');

const createPatient = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Patient user data
    const userData = {
      email: 'patient@gmail.com',
      password: '12345678',
      phone: '+1234567893'
    };

    const patientData = {
      firstName: 'John',
      lastName: 'Smith',
      gender: 'male',
      birthDate: new Date('1990-05-15'),
      address: {
        city: 'Chicago'
      }
    };

    // Check if patient already exists
    const existingPatient = await Patient.findOne()
      .populate('userId')
      .then(patient => {
        if (patient && patient.userId && patient.userId.email === userData.email) {
          return patient;
        }
        return null;
      });

    if (existingPatient) {
      console.log('⚠️  Patient already exists with email:', userData.email);
      console.log('Patient ID:', existingPatient._id);
      process.exit(0);
    }

    // Create patient with user
    console.log('📝 Creating patient user...');
    const result = await Patient.createWithUser(userData, patientData);

    console.log('✅ Patient created successfully!');
    console.log('📧 Email:', result.user.email);
    console.log('👤 Name:', result.patient.firstName, result.patient.lastName);
    console.log('👤 Gender:', result.patient.gender);
    console.log('🎂 Birth Date:', result.patient.birthDate.toDateString());
    console.log('📍 City:', result.patient.address.city);
    console.log('🆔 User ID:', result.user._id);
    console.log('🆔 Patient ID:', result.patient._id);
    console.log('\n🔐 Login credentials:');
    console.log('   Email:', userData.email);
    console.log('   Password:', userData.password);

    process.exit(0);
  } catch (error) {
    // Check if it's a retryable MongoDB write conflict
    if (error.code === 112 && retryCount < maxRetries) {
      console.log(`⚠️  MongoDB write conflict detected. Retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return createPatient(retryCount + 1);
    }
    
    console.error('❌ Error creating patient:', error);
    process.exit(1);
  }
};

// Run the script
createPatient();