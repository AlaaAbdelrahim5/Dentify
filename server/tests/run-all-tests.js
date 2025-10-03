#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Dentify User System
 * 
 * This script runs all user creation tests, validates the database,
 * and provides comprehensive reporting.
 * 
 * Usage: node run-all-tests.js [options]
 * Options:
 *   --clean     Clean database before running tests
 *   --no-create Skip user creation, just validate existing data
 *   --verbose   Show detailed output
 */

const { spawn } = require('child_process');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../config/database');

// Import models for validation
const User = require('../models/User');
const Admin = require('../models/Admin');
const Clinic = require('../models/Clinic');
const RadiologyCenter = require('../models/RadiologyCenter');
const Patient = require('../models/Patient');
const Dentist = require('../models/Dentist');
const Secretary = require('../models/Secretary');

const userTypes = {
  admin: { script: 'create-admin.js', model: Admin, email: 'admin@gmail.com' },
  clinic: { script: 'create-clinic.js', model: Clinic, email: 'clinic@gmail.com' },
  radiology: { script: 'create-radiology-center.js', model: RadiologyCenter, email: 'radiology@gmail.com' },
  patient: { script: 'create-patient.js', model: Patient, email: 'patient@gmail.com' },
  dentist: { script: 'create-dentist.js', model: Dentist, email: 'dentist@gmail.com' },
  secretary: { script: 'create-secretary.js', model: Secretary, email: 'secretary@gmail.com' }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  clean: args.includes('--clean'),
  noCreate: args.includes('--no-create'),
  verbose: args.includes('--verbose')
};

const log = (message, force = false) => {
  if (options.verbose || force) {
    console.log(message);
  }
};

const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    log(`\n🚀 Running ${scriptName}...`, true);
    log('=' + '='.repeat(50), true);
    
    const child = spawn('node', [scriptName], {
      cwd: __dirname,
      stdio: options.verbose ? 'inherit' : 'pipe'
    });

    let output = '';
    if (!options.verbose) {
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      child.stderr?.on('data', (data) => {
        output += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${scriptName} completed successfully\n`, true);
        resolve({ success: true, output });
      } else {
        log(`❌ ${scriptName} failed with exit code ${code}\n`, true);
        if (!options.verbose && output) {
          console.log('Error output:', output);
        }
        reject(new Error(`Script ${scriptName} failed`));
      }
    });

    child.on('error', (error) => {
      console.error(`❌ Error running ${scriptName}:`, error);
      reject(error);
    });
  });
};

const validateUserData = async (userType, config) => {
  try {
    log(`🔍 Validating ${userType} data...`);
    
    // Find user by email
    const user = await User.findOne({ email: config.email });
    if (!user) {
      return { valid: false, error: `User with email ${config.email} not found` };
    }
    
    // Check user role
    if (user.role !== userType.charAt(0).toUpperCase() + userType.slice(1)) {
      const expectedRole = userType === 'radiology' ? 'RadiologyCenter' : 
                          userType.charAt(0).toUpperCase() + userType.slice(1);
      if (user.role !== expectedRole) {
        return { valid: false, error: `User role mismatch. Expected: ${expectedRole}, Got: ${user.role}` };
      }
    }
    
    // Find profile data
    const profile = await config.model.findOne({ userId: user._id });
    if (!profile) {
      return { valid: false, error: `${userType} profile not found for user` };
    }
    
    // Validate required fields based on user type
    let requiredFields = [];
    switch (userType) {
      case 'admin':
        requiredFields = ['firstName', 'lastName', 'gender'];
        break;
      case 'clinic':
        requiredFields = ['clinicName', 'registrationNumber', 'city', 'location'];
        break;
      case 'radiology':
        requiredFields = ['centerName', 'registrationNumber', 'city', 'supportedTypes'];
        break;
      case 'patient':
        requiredFields = ['firstName', 'lastName', 'gender', 'birthDate'];
        break;
      case 'dentist':
        requiredFields = ['firstName', 'lastName', 'licenseNumber', 'specialization'];
        break;
      case 'secretary':
        requiredFields = ['firstName', 'lastName', 'gender', 'birthDate'];
        break;
    }
    
    for (const field of requiredFields) {
      if (!profile[field] || (Array.isArray(profile[field]) && profile[field].length === 0)) {
        return { valid: false, error: `Required field '${field}' is missing or empty` };
      }
    }
    
    return { 
      valid: true, 
      data: { 
        userId: user._id, 
        profileId: profile._id, 
        email: user.email,
        role: user.role,
        status: user.status 
      } 
    };
    
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const cleanDatabase = async () => {
  console.log('🧹 Cleaning database...');
  try {
    await connectDB();
    
    // Delete all test users and their profiles
    const testEmails = Object.values(userTypes).map(config => config.email);
    const testUsers = await User.find({ email: { $in: testEmails } });
    
    log(`Found ${testUsers.length} test users to delete`);
    
    for (const user of testUsers) {
      // Delete profile based on role
      switch (user.role) {
        case 'Admin':
          await Admin.deleteOne({ userId: user._id });
          break;
        case 'Clinic':
          await Clinic.deleteOne({ userId: user._id });
          break;
        case 'RadiologyCenter':
          await RadiologyCenter.deleteOne({ userId: user._id });
          break;
        case 'Patient':
          await Patient.deleteOne({ userId: user._id });
          break;
        case 'Dentist':
          await Dentist.deleteOne({ userId: user._id });
          break;
        case 'Secretary':
          await Secretary.deleteOne({ userId: user._id });
          break;
      }
      
      // Delete user
      await User.deleteOne({ _id: user._id });
      log(`Deleted ${user.role} user: ${user.email}`);
    }
    
    console.log('✅ Database cleaned successfully');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  }
};

const createAllUsers = async () => {
  if (options.noCreate) {
    console.log('⏭️  Skipping user creation (--no-create flag)');
    return {};
  }
  
  console.log('🔄 Creating all user types...');
  
  // Create in order: clinic first (required for dentist and secretary)
  const orderedTypes = ['admin', 'clinic', 'radiology', 'patient', 'dentist', 'secretary'];
  
  let successCount = 0;
  let failureCount = 0;
  const results = {};
  
  for (const type of orderedTypes) {
    try {
      const result = await runScript(userTypes[type].script);
      successCount++;
      results[type] = { status: 'success', ...result };
    } catch (error) {
      console.error(`Failed to create ${type}:`, error.message);
      failureCount++;
      results[type] = { status: 'failed', error: error.message };
    }
  }
  
  console.log('\n📊 CREATION SUMMARY');
  console.log('=' + '='.repeat(30));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📊 Total: ${orderedTypes.length}`);
  
  return results;
};

const validateAllUsers = async () => {
  console.log('\n🔍 Validating all users...');
  
  await connectDB();
  
  let validCount = 0;
  let invalidCount = 0;
  const validationResults = {};
  
  for (const [userType, config] of Object.entries(userTypes)) {
    const validation = await validateUserData(userType, config);
    validationResults[userType] = validation;
    
    if (validation.valid) {
      validCount++;
      console.log(`✅ ${userType.padEnd(12)} - Valid`);
      log(`   User ID: ${validation.data.userId}`);
      log(`   Profile ID: ${validation.data.profileId}`);
      log(`   Status: ${validation.data.status}`);
    } else {
      invalidCount++;
      console.log(`❌ ${userType.padEnd(12)} - Invalid: ${validation.error}`);
    }
  }
  
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('=' + '='.repeat(30));
  console.log(`✅ Valid: ${validCount}`);
  console.log(`❌ Invalid: ${invalidCount}`);
  console.log(`📊 Total: ${Object.keys(userTypes).length}`);
  
  return validationResults;
};

const showFinalReport = async () => {
  console.log('\n📋 FINAL DATABASE STATE');
  console.log('=' + '='.repeat(30));
  
  try {
    await runScript('check-users.js');
  } catch (error) {
    console.log('⚠️  Could not generate final report');
  }
};

const showUsage = () => {
  console.log('🧪 Dentify Complete Test Suite');
  console.log('=============================');
  console.log('');
  console.log('Usage: node run-all-tests.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --clean      Clean database before running tests');
  console.log('  --no-create  Skip user creation, just validate existing data');
  console.log('  --verbose    Show detailed output from all scripts');
  console.log('');
  console.log('Examples:');
  console.log('  node run-all-tests.js                    - Run all tests');
  console.log('  node run-all-tests.js --clean            - Clean DB and run all tests');
  console.log('  node run-all-tests.js --no-create        - Only validate existing users');
  console.log('  node run-all-tests.js --verbose --clean  - Clean DB and run with verbose output');
  console.log('');
};

// Main execution
const main = async () => {
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  console.log('🧪 Dentify Complete Test Suite Starting...');
  console.log('==========================================');
  
  const startTime = Date.now();
  
  try {
    // Clean database if requested
    if (options.clean) {
      await cleanDatabase();
    }
    
    // Create all users
    const creationResults = await createAllUsers();
    
    // Validate all users
    const validationResults = await validateAllUsers();
    
    // Show final report
    await showFinalReport();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 TEST SUITE COMPLETED!');
    console.log(`⏱️  Total time: ${duration}s`);
    
    // Exit with appropriate code
    const hasFailures = Object.values(validationResults).some(r => !r.valid) ||
                       Object.values(creationResults).some(r => r.status === 'failed');
    
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
};

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});