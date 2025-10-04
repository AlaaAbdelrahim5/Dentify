const { default: fetch } = require('node-fetch');

async function testDentistAPI() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in as clinic...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'clinic@gmail.com',
        password: '12345678'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? 'Success' : 'Failed');

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.tokens.accessToken;
    console.log('✅ Login successful, token received');

    // Now test creating a dentist
    console.log('🦷 Creating dentist request...');
    const dentistData = {
      firstName: 'Dr. Ahmad',
      lastName: 'Al-Masri',
      email: 'ahmad.almasri@example.com',
      phone: '+963987654321',
      password: 'dentist123',
      licenseNumber: 'DEN-2025-001',
      specialization: ['General Dentistry', 'Orthodontics'],
      birthDate: '1985-03-15',
      gender: 'male',
      address: {
        city: 'Damascus'
      },
      appointmentDuration: 45,
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
        }
      ],
      socialLinks: {
        facebook: 'https://facebook.com/dr.ahmad',
        instagram: 'https://instagram.com/dr.ahmad'
      }
    };

    const createResponse = await fetch('http://localhost:5000/api/dentists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dentistData),
    });

    console.log('Response status:', createResponse.status);
    
    const responseText = await createResponse.text();
    console.log('Response text length:', responseText.length);

    // Try to parse as JSON
    let createData;
    try {
      createData = JSON.parse(responseText);
      console.log('Create response:', createData);
    } catch (e) {
      console.error('❌ Failed to parse JSON response');
      console.log('Raw response:', responseText.substring(0, 500));
      return;
    }

    if (createData.success) {
      console.log('✅ Dentist request created successfully!');
      console.log('Status:', createData.data.userId?.status || 'Unknown');
      console.log('Message:', createData.message);
    } else {
      console.error('❌ Failed to create dentist:', createData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  process.exit(0);
}

testDentistAPI();