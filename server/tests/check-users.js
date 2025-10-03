const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');

// Import all models
const User = require('../models/User');
const Admin = require('../models/Admin');
const Clinic = require('../models/Clinic');
const RadiologyCenter = require('../models/RadiologyCenter');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Secretary = require('../models/Secretary');

const checkUsers = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');
    console.log('\n📊 Database User Summary');
    console.log('=' + '='.repeat(40));

    // Get all users
    const users = await User.find({}).select('email role status createdAt');
    console.log(`\n👥 Total Users: ${users.length}`);
    
    if (users.length === 0) {
      console.log('📝 No users found in database');
      process.exit(0);
    }

    // Group by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {});

    // Display each role
    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`\n${getRoleIcon(role)} ${role.toUpperCase()} USERS (${roleUsers.length}):`);
      console.log('-'.repeat(30));
      
      for (const user of roleUsers) {
        console.log(`  📧 ${user.email}`);
        console.log(`     Status: ${getStatusIcon(user.status)} ${user.status}`);
        console.log(`     Created: ${user.createdAt.toLocaleDateString()}`);
        
        // Get additional profile info based on role
        try {
          let profile = null;
          switch (role) {
            case 'Admin':
              profile = await Admin.findOne({ userId: user._id });
              if (profile) {
                console.log(`     Name: ${profile.firstName} ${profile.lastName}`);
                console.log(`     Permissions: ${profile.permissions.length} permissions`);
              }
              break;
            case 'Clinic':
              profile = await Clinic.findOne({ userId: user._id });
              if (profile) {
                console.log(`     Clinic: ${profile.clinicName}`);
                console.log(`     City: ${profile.city}`);
                console.log(`     Registration: ${profile.registrationNumber}`);
                console.log(`     Services: ${profile.servicesAvailable.length} services`);
              }
              break;
            case 'RadiologyCenter':
              profile = await RadiologyCenter.findOne({ userId: user._id });
              if (profile) {
                console.log(`     Center: ${profile.centerName}`);
                console.log(`     City: ${profile.city}`);
                console.log(`     Registration: ${profile.registrationNumber}`);
                console.log(`     Types: ${profile.supportedTypes.length} imaging types`);
              }
              break;
            case 'Patient':
              profile = await Patient.findOne({ userId: user._id });
              if (profile) {
                console.log(`     Name: ${profile.firstName} ${profile.lastName}`);
                console.log(`     City: ${profile.address.city}`);
                console.log(`     Allergies: ${profile.medicalHistory.allergies.length} allergies`);
              }
              break;
            case 'Dentist':
              profile = await Dentist.findOne({ userId: user._id }).populate('clinicId', 'clinicName');
              if (profile) {
                console.log(`     Name: ${profile.firstName} ${profile.lastName}`);
                console.log(`     License: ${profile.licenseNumber}`);
                console.log(`     Specialization: ${profile.specialization.join(', ')}`);
                console.log(`     Clinic: ${profile.clinicId?.clinicName || 'Not assigned'}`);
                console.log(`     Experience: ${profile.experience} years`);
              }
              break;
            case 'Secretary':
              profile = await Secretary.findOne({ userId: user._id }).populate('clinicId', 'clinicName');
              if (profile) {
                console.log(`     Name: ${profile.firstName} ${profile.lastName}`);
                console.log(`     Clinic: ${profile.clinicId?.clinicName || 'Not assigned'}`);
                console.log(`     Experience: ${profile.experience} years`);
                console.log(`     Languages: ${profile.languages.join(', ')}`);
              }
              break;
          }
        } catch (error) {
          console.log(`     ⚠️  Profile data not found or error: ${error.message}`);
        }
        
        console.log('');
      }
    }

    // Summary statistics
    console.log('\n📈 STATISTICS:');
    console.log('-'.repeat(20));
    console.log(`Total Users: ${users.length}`);
    console.log(`Active Users: ${users.filter(u => u.status === 'active').length}`);
    console.log(`Inactive Users: ${users.filter(u => u.status === 'inactive').length}`);
    console.log(`Pending Users: ${users.filter(u => u.status === 'pending').length}`);
    
    console.log('\nRole Distribution:');
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`  ${role}: ${roleUsers.length}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
};

const getRoleIcon = (role) => {
  const icons = {
    'Admin': '👑',
    'Clinic': '🏥',
    'RadiologyCenter': '📡',
    'Patient': '🩺',
    'Dentist': '🦷',
    'Secretary': '📋'
  };
  return icons[role] || '👤';
};

const getStatusIcon = (status) => {
  const icons = {
    'active': '✅',
    'inactive': '❌',
    'pending': '⏳',
    'suspended': '🚫'
  };
  return icons[status] || '❓';
};

// Run the script
checkUsers();