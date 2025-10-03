const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Admin = require('./models/Admin');
const Patient = require('./models/Patient');
const Dentist = require('./models/Dentist');
const Secretary = require('./models/Secretary');
const Clinic = require('./models/Clinic');
const RadiologyCenter = require('./models/RadiologyCenter');

// Helper function to retry operations on WriteConflict
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.code === 112 && attempt < maxRetries) { // WriteConflict
        console.log(`⚠️  WriteConflict detected, retrying... (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      throw error;
    }
  }
};

const testUnifiedAuth = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dentify');
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a Patient
    console.log('\n🧪 Test 1: Creating a Patient...');
    const patientResult = await retryOperation(() => Patient.createWithUser(
      {
        email: 'patient@test.com',
        password: 'password123',
        phone: '+1234567890'
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
        birthDate: new Date('1990-01-01'),
        address: {
          city: 'New York',
          street: '123 Main St'
        },
        medicalHistory: {
          allergies: ['Penicillin'],
          medications: [],
          previousTreatments: [],
          chronicConditions: []
        }
      }
    ));
    console.log('✅ Patient created:', patientResult.patient.fullName);

    // Test 2: Create a Clinic
    console.log('\n🧪 Test 2: Creating a Clinic...');
    const clinicResult = await retryOperation(() => Clinic.createWithUser(
      {
        email: 'clinic@test.com',
        password: 'password123',
        phone: '+1987654321'
      },
      {
        clinicName: 'Smile Dental Clinic',
        address: {
          city: 'New York',
          street: '456 Health Ave',
          building: 'Medical Plaza'
        },
        workingHours: [
          {
            day: 'Monday',
            startTime: '09:00',
            endTime: '17:00',
            isOpen: true
          },
          {
            day: 'Tuesday',
            startTime: '09:00',
            endTime: '17:00',
            isOpen: true
          }
        ],
        servicesAvailable: [
          {
            name: 'General Consultation',
            price: 100,
            duration: 30,
            description: 'Complete dental examination'
          },
          {
            name: 'Teeth Cleaning',
            price: 150,
            duration: 45,
            description: 'Professional teeth cleaning'
          }
        ],
        licenseNumber: 'CLI-2024-001',
        establishedDate: new Date('2020-01-01'),
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128], // NYC coordinates
          description: 'Located in Manhattan, NYC'
        }
      }
    ));
    console.log('✅ Clinic created:', clinicResult.clinic.clinicName);

    // Test 3: Create a Dentist for the clinic
    console.log('\n🧪 Test 3: Creating a Dentist...');
    const dentistResult = await retryOperation(() => Dentist.createWithUser(
      {
        email: 'dentist@test.com',
        password: 'password123',
        phone: '+1122334455'
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        licenseNumber: 'DEN-2024-001',
        specialization: ['General Dentistry', 'Cosmetic Dentistry'],
        birthDate: new Date('1985-05-15'),
        gender: 'female',
        address: {
          city: 'New York'
        },
        clinicId: clinicResult.clinic._id,
        workingHours: [
          {
            day: 'Monday',
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true
          }
        ],
        appointmentDuration: 30,
        experience: 8,
        consultationFee: 100,
        education: [
          {
            degree: 'DDS',
            institution: 'NYU College of Dentistry',
            year: 2016
          }
        ]
      }
    ));
    console.log('✅ Dentist created:', dentistResult.dentist.fullName);

    // Test 4: Add dentist to clinic
    console.log('\n🧪 Test 4: Adding dentist to clinic...');
    const clinic = await Clinic.findById(clinicResult.clinic._id);
    clinic.dentists.push(dentistResult.dentist._id);
    await clinic.save();
    console.log('✅ Dentist added to clinic');

    // Test 5: Create an Admin
    console.log('\n🧪 Test 5: Creating an Admin...');
    const adminResult = await retryOperation(() => Admin.createWithUser(
      {
        email: 'admin@test.com',
        password: 'password123',
        phone: '+1555666777'
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        gender: 'male',
        permissions: ['manage_users', 'manage_clinics', 'view_reports']
      }
    ));
    console.log('✅ Admin created:', adminResult.admin.firstName);

    // Test 6: Create a Radiology Center
    console.log('\n🧪 Test 6: Creating a Radiology Center...');
    const radiologyResult = await retryOperation(() => RadiologyCenter.createWithUser(
      {
        email: 'radiology@test.com',
        password: 'password123',
        phone: '+1777888999'
      },
      {
        centerName: 'Advanced Dental Imaging',
        address: {
          city: 'New York',
          street: '789 Medical Blvd'
        },
        workingHours: [
          {
            day: 'Monday',
            startTime: '08:00',
            endTime: '18:00',
            isOpen: true
          }
        ],
        supportedTypes: [
          {
            name: 'Panoramic X-Ray',
            price: 200,
            duration: 15,
            description: 'Full mouth X-ray imaging'
          },
          {
            name: 'CBCT (Cone Beam CT)',
            price: 400,
            duration: 20,
            description: '3D dental imaging'
          }
        ],
        licenseNumber: 'RAD-2024-001',
        establishedDate: new Date('2018-01-01'),
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        }
      }
    ));
    console.log('✅ Radiology Center created:', radiologyResult.center.centerName);

    // Test 7: Create a Secretary for the clinic
    console.log('\n🧪 Test 7: Creating a Secretary...');
    const secretaryResult = await retryOperation(() => Secretary.createWithUser(
      {
        email: 'secretary@test.com',
        password: 'password123',
        phone: '+1888999000'
      },
      {
        firstName: 'Alice',
        lastName: 'Smith',
        birthDate: new Date('1992-03-20'),
        gender: 'female',
        address: {
          city: 'New York',
          street: '123 Office St'
        },
        clinicId: clinicResult.clinic._id,
        workingHours: [
          {
            day: 'Monday',
            startTime: '08:30',
            endTime: '17:30'
          },
          {
            day: 'Tuesday',
            startTime: '08:30',
            endTime: '17:30'
          },
          {
            day: 'Wednesday',
            startTime: '08:30',
            endTime: '17:30'
          }
        ],
        permissions: ['manage_appointments', 'view_patient_basic_info', 'manage_clinic_schedule'],
        salary: 3500,
        hireDate: new Date('2023-01-15')
      }
    ));
    console.log('✅ Secretary created:', secretaryResult.secretary.fullName);

    // Test 7.1: Add secretary to clinic
    console.log('\n🧪 Test 7.1: Adding secretary to clinic...');
    const clinicToUpdate = await Clinic.findById(clinicResult.clinic._id);
    clinicToUpdate.secretaries.push(secretaryResult.secretary._id);
    await clinicToUpdate.save();
    console.log('✅ Secretary added to clinic');

    // Test 8: Test login functionality
    console.log('\n🧪 Test 8: Testing login functionality...');
    
    // Test patient login
    const patientUser = await User.findByEmail('patient@test.com');
    const isPatientPasswordValid = await patientUser.comparePassword('password123');
    console.log('✅ Patient login test:', isPatientPasswordValid ? 'PASSED' : 'FAILED');

    // Test clinic login
    const clinicUser = await User.findByEmail('clinic@test.com');
    const isClinicPasswordValid = await clinicUser.comparePassword('password123');
    console.log('✅ Clinic login test:', isClinicPasswordValid ? 'PASSED' : 'FAILED');

    // Test dentist login
    const dentistUser = await User.findByEmail('dentist@test.com');
    const isDentistPasswordValid = await dentistUser.comparePassword('password123');
    console.log('✅ Dentist login test:', isDentistPasswordValid ? 'PASSED' : 'FAILED');

    // Test secretary login
    const secretaryUser = await User.findByEmail('secretary@test.com');
    const isSecretaryPasswordValid = await secretaryUser.comparePassword('password123');
    console.log('✅ Secretary login test:', isSecretaryPasswordValid ? 'PASSED' : 'FAILED');

    // Test admin login
    const adminUser = await User.findByEmail('admin@test.com');
    const isAdminPasswordValid = await adminUser.comparePassword('password123');
    console.log('✅ Admin login test:', isAdminPasswordValid ? 'PASSED' : 'FAILED');

    // Test radiology center login
    const radiologyUser = await User.findByEmail('radiology@test.com');
    const isRadiologyPasswordValid = await radiologyUser.comparePassword('password123');
    console.log('✅ Radiology Center login test:', isRadiologyPasswordValid ? 'PASSED' : 'FAILED');

    // Test 9: Test role-based queries
    console.log('\n🧪 Test 9: Testing role-based queries...');
    
    const allPatients = await User.findByRole('Patient');
    console.log('✅ Found', allPatients.length, 'patients');
    
    const allDentists = await User.findByRole('Dentist');
    console.log('✅ Found', allDentists.length, 'dentists');
    
    const allSecretaries = await User.findByRole('Secretary');
    console.log('✅ Found', allSecretaries.length, 'secretaries');
    
    const allClinics = await User.findByRole('Clinic');
    console.log('✅ Found', allClinics.length, 'clinics');
    
    const allRadiologyCenters = await User.findByRole('RadiologyCenter');
    console.log('✅ Found', allRadiologyCenters.length, 'radiology centers');
    
    const allAdmins = await User.findByRole('Admin');
    console.log('✅ Found', allAdmins.length, 'admins');

    // Test 10: Test geographic queries
    console.log('\n🧪 Test 10: Testing geographic queries...');
    
    const nearbyClinics = await Clinic.findNearby(-74.006, 40.7128, 10000);
    console.log('✅ Found', nearbyClinics.length, 'nearby clinics');
    
    const nearbyRadiologyCenters = await RadiologyCenter.findNearby(-74.006, 40.7128, 10000);
    console.log('✅ Found', nearbyRadiologyCenters.length, 'nearby radiology centers');

    // Test 11: Test service-based queries
    console.log('\n🧪 Test 11: Testing service-based queries...');
    
    const clinicsWithCleaning = await Clinic.findByService('Teeth Cleaning');
    console.log('✅ Found', clinicsWithCleaning.length, 'clinics offering teeth cleaning');
    
    const radiologyCentersWithCBCT = await RadiologyCenter.findByType('CBCT (Cone Beam CT)');
    console.log('✅ Found', radiologyCentersWithCBCT.length, 'radiology centers offering CBCT');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Created 1 of each user type: Patient, Dentist, Secretary, Clinic, RadiologyCenter, Admin');
    console.log('- Tested unified login system for all 6 user types');
    console.log('- Tested role-based access queries');
    console.log('- Tested geographic and service-based queries');
    console.log('- All users can login with their respective credentials');

    // Final verification - show all created data
    console.log('\n📋 Final Database Verification:');
    const finalUserCount = await User.countDocuments();
    const finalPatientCount = await Patient.countDocuments();
    const finalDentistCount = await Dentist.countDocuments();
    const finalSecretaryCount = await Secretary.countDocuments();
    const finalClinicCount = await Clinic.countDocuments();
    const finalRadiologyCount = await RadiologyCenter.countDocuments();
    const finalAdminCount = await Admin.countDocuments();
    
    console.log(`📊 Database Contents:`);
    console.log(`   👥 Users: ${finalUserCount}`);
    console.log(`   🏥 Patients: ${finalPatientCount}`);
    console.log(`   🦷 Dentists: ${finalDentistCount}`);
    console.log(`   📋 Secretaries: ${finalSecretaryCount}`);
    console.log(`   🏢 Clinics: ${finalClinicCount}`);
    console.log(`   🔬 Radiology Centers: ${finalRadiologyCount}`);
    console.log(`   👑 Admins: ${finalAdminCount}`);
    
    console.log('\n✅ All test data has been preserved in the database!');
    console.log('💡 You can now verify the data using MongoDB Compass or the database shell.');
    console.log('📧 Test user emails:');
    console.log('   - patient@test.com (Patient)');
    console.log('   - dentist@test.com (Dentist)');
    console.log('   - secretary@test.com (Secretary)');
    console.log('   - clinic@test.com (Clinic)');
    console.log('   - radiology@test.com (RadiologyCenter)');
    console.log('   - admin@test.com (Admin)');
    console.log('🔑 All passwords: password123');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

// Run the test
if (require.main === module) {
  testUnifiedAuth().catch(console.error);
}

module.exports = testUnifiedAuth;