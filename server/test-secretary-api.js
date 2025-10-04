const { default: fetch } = require('node-fetch');

async function testSecretaryAPI() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in...');
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
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.tokens.accessToken;
    console.log('✅ Login successful, token received');

    // Now test creating a secretary
    console.log('👤 Creating secretary...');
    const secretaryData = {
      firstName: 'Test',
      lastName: 'Secretary',
      birthDate: '1995-05-15',
      gender: 'female',
      address: {
        city: 'Damascus'
      },
      userId: {
        email: 'testsecretary@example.com',
        phone: '+963123456789',
        password: 'password123',
        role: 'Secretary',
        status: 'active'
      }
    };

    const createResponse = await fetch('http://localhost:5000/api/secretaries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(secretaryData),
    });

    console.log('Response status:', createResponse.status);
    console.log('Response headers:', createResponse.headers.raw());
    
    const responseText = await createResponse.text();
    console.log('Response text:', responseText);

    // Try to parse as JSON
    let createData;
    try {
      createData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse JSON response');
      return;
    }
    console.log('Create response:', createData);

    if (createData.success) {
      console.log('✅ Secretary created successfully!');
    } else {
      console.error('❌ Failed to create secretary:', createData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  process.exit(0);
}

testSecretaryAPI();