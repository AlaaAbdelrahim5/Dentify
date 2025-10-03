# Patient Signup - Frontend to Backend Integration

## Overview
This document explains the complete integration between the frontend and backend for patient signup in the Dentify application.

## Changes Made

### 1. Backend Setup ✅
- **Server**: Running on `http://localhost:5000`
- **Database**: MongoDB Atlas connected successfully
- **Endpoint**: `POST /api/auth/register`

### 2. Frontend Changes

#### `client/src/services/api.js`
- Updated the signup endpoint from `/auth/signup` to `/auth/register` to match backend route
- The API service correctly handles authentication tokens and error responses

#### `client/src/pages/SignUp.jsx`
Updated the signup form to:
1. **Added Gender Field**: Required by the backend Patient model
   - Options: Male/Female
   - Validation added
   - Icon: FaVenusMars

2. **Data Transformation**: The form data is now transformed to match backend expectations:
   ```javascript
   {
     role: 'Patient',
     userData: {
       email: string,
       password: string,
       phoneNumber: string (with country code)
     },
     profileData: {
       firstName: string,
       lastName: string,
       gender: 'male' | 'female',
       birthDate: Date,
       address: {
         city: string
       }
     }
   }
   ```

3. **Success Flow**: After successful signup:
   - Token is stored in localStorage
   - User data is stored in localStorage
   - Redirects to Patient Dashboard after 2 seconds

4. **Error Handling**: Improved error messages for:
   - Duplicate email
   - Duplicate phone number
   - Validation errors
   - Server errors

## How It Works

### Backend Flow (`/api/auth/register`)
1. Receives `role`, `userData`, and `profileData`
2. Validates the data
3. Creates a User document with the email, password, and phone
4. Creates a Patient profile linked to the User
5. Both operations happen in a transaction (all or nothing)
6. Returns JWT token, user info, and profile data

### Frontend Flow
1. User fills the signup form
2. Form validation checks all required fields
3. On submit, data is formatted according to backend expectations
4. API call is made to `/api/auth/register`
5. On success: Store token and redirect to dashboard
6. On error: Display appropriate error message

## Testing the Signup

### Prerequisites
- Backend server running on port 5000 ✅
- Frontend server running on port 5174 ✅
- MongoDB connection active ✅

### Test Steps

1. **Navigate to Signup Page**
   ```
   http://localhost:5174/signup
   ```

2. **Fill the Form**
   - Full Name: e.g., "John Doe"
   - Email: e.g., "john.doe@example.com"
   - Phone: e.g., "599123456" (with +970 country code)
   - Date of Birth: Select a date
   - Gender: Select Male or Female ← NEW FIELD
   - City: Select from Palestinian cities
   - Password: At least 8 characters
   - Confirm Password: Must match password
   - Accept Terms: Check the checkbox

3. **Submit the Form**
   - Click "Create Account"
   - Watch for success message
   - Should redirect to `/patient/dashboard` after 2 seconds

4. **Verify in Database**
   You can check MongoDB to see:
   - New document in `users` collection
   - New document in `patients` collection
   - Both linked via `userId`

## API Request Example

```javascript
// What the frontend sends
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "role": "Patient",
  "userData": {
    "email": "john.doe@example.com",
    "password": "SecurePass123",
    "phoneNumber": "+970599123456"
  },
  "profileData": {
    "firstName": "John",
    "lastName": "Doe",
    "gender": "male",
    "birthDate": "1990-01-15",
    "address": {
      "city": "ramallah"
    }
  }
}
```

## API Response Example

```javascript
// Successful response
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "email": "john.doe@example.com",
      "role": "Patient",
      "phoneNumber": "+970599123456",
      "status": "active"
    },
    "profile": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "gender": "male",
      "birthDate": "1990-01-15T00:00:00.000Z",
      "address": {
        "city": "ramallah"
      },
      "userId": "..."
    },
    "role": "Patient"
  }
}
```

## Error Handling

### Common Errors

1. **Email Already Exists**
   ```json
   {
     "success": false,
     "message": "email already exists"
   }
   ```
   Frontend displays: "An account with this email already exists"

2. **Phone Number Already Exists**
   ```json
   {
     "success": false,
     "message": "phoneNumber already exists"
   }
   ```
   Frontend displays: "An account with this phone number already exists"

3. **Validation Error**
   ```json
   {
     "success": false,
     "message": "Validation error",
     "errors": ["Email is required", "Password must be at least 8 characters"]
   }
   ```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt before storing
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: Both frontend and backend validate inputs
4. **Transaction Safety**: Database operations use transactions
5. **CORS**: Configured to accept requests from frontend

## Next Steps

After successful patient signup integration, you can:

1. ✅ Test the signup with different data
2. ⏭️ Implement login for patients
3. ⏭️ Connect Patient Dashboard to display user data
4. ⏭️ Implement other user type registrations (Dentist, Secretary, etc.)
5. ⏭️ Add email verification
6. ⏭️ Add forgot password functionality

## Troubleshooting

### Issue: "Network Error" or "Failed to Fetch"
- **Solution**: Ensure backend server is running on port 5000
- Check: `http://localhost:5000/`

### Issue: "CORS Error"
- **Solution**: Backend already has CORS configured, but verify it's enabled

### Issue: "MongoDB Connection Failed"
- **Solution**: Check .env file has correct MONGODB_URI
- Verify network connection to MongoDB Atlas

### Issue: Form validation fails
- **Solution**: Ensure all required fields are filled
- Check password is at least 8 characters
- Verify email format is correct
- Make sure gender is selected

## Current Status

✅ Backend server running  
✅ Frontend server running  
✅ Database connected  
✅ API endpoints configured  
✅ Form validation complete  
✅ Data transformation correct  
✅ Error handling implemented  
✅ Token storage implemented  
✅ Gender field added  
✅ Ready for testing!

---

**Date**: October 3, 2025  
**Integration**: Patient Signup  
**Status**: Complete and Ready for Testing
