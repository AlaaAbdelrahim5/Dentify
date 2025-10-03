# Quick Test Guide - Patient Signup

## 🚀 Quick Start

### Servers Running
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:5174
- ✅ Database: Connected to MongoDB Atlas

### Test URL
```
http://localhost:5174/signup
```

## 📝 Test Data Example

Use this sample data to test the signup:

### Form Fields:
| Field | Example Value |
|-------|---------------|
| Full Name | Ahmad Hassan |
| Email | ahmad.hassan@example.com |
| Country Code | +970 (Palestine) |
| Phone Number | 599123456 |
| Date of Birth | 1995-03-15 |
| Gender | Male |
| City | Ramallah |
| Password | MyPassword123! |
| Confirm Password | MyPassword123! |
| Terms | ✓ Checked |

### Expected Result:
1. ✅ Success message appears
2. ✅ Token stored in localStorage
3. ✅ Redirect to `/patient/dashboard` after 2 seconds

## 🧪 Testing Steps

### Test 1: Successful Signup
1. Go to http://localhost:5174/signup
2. Fill all fields with valid data
3. Click "Create Account"
4. Should see green success message
5. Should redirect to dashboard

### Test 2: Duplicate Email
1. Try to signup with the same email again
2. Should see error: "An account with this email already exists"

### Test 3: Validation Errors
Try submitting with:
- Empty fields → Should show field-specific errors
- Invalid email (e.g., "notanemail") → "Email is invalid"
- Short password (< 8 chars) → "Password must be at least 8 characters"
- Mismatched passwords → "Passwords do not match"
- Unchecked terms → "You must accept the terms and conditions"

### Test 4: Phone Number Format
- Phone should be numbers only (no spaces or dashes)
- Minimum 7 digits required
- Country code is automatically prepended

## 🔍 How to Verify in Database

### Option 1: MongoDB Compass
1. Connect to: `mongodb+srv://abdullah:123@adweb.ms9wqqy.mongodb.net/`
2. Select database: `test`
3. Check collections:
   - `users` - Should have new user with email
   - `patients` - Should have patient profile linked to user

### Option 2: MongoDB Atlas
1. Login to MongoDB Atlas
2. Browse Collections
3. Find your test user

## 🛠️ Developer Tools

### Check localStorage (Browser Console)
```javascript
// Check token
localStorage.getItem('token')

// Check user data
JSON.parse(localStorage.getItem('user'))

// Check role
localStorage.getItem('role')
```

### Check Network Request (Browser DevTools)
1. Open DevTools (F12)
2. Go to Network tab
3. Submit signup form
4. Look for request to `http://localhost:5000/api/auth/register`
5. Check Request Payload and Response

### Example Request Payload:
```json
{
  "role": "Patient",
  "userData": {
    "email": "ahmad.hassan@example.com",
    "password": "MyPassword123!",
    "phoneNumber": "+970599123456"
  },
  "profileData": {
    "firstName": "Ahmad",
    "lastName": "Hassan",
    "gender": "male",
    "birthDate": "1995-03-15",
    "address": {
      "city": "ramallah"
    }
  }
}
```

## ⚠️ Common Issues & Solutions

### Frontend shows blank page
- Check browser console for errors
- Verify frontend server is running: http://localhost:5174

### "Network Error" when submitting
- Ensure backend is running: http://localhost:5000
- Check CORS is enabled (already configured)

### Password strength indicator not showing
- Normal - only appears when typing password
- Shows: Very Weak → Weak → Fair → Good → Strong

### Form doesn't submit
- Check all required fields are filled
- Verify terms checkbox is checked
- Check browser console for validation errors

### Success but no redirect
- Check if Patient Dashboard route exists
- Verify navigation is working
- May need to implement dashboard page if not exists

## 📊 Backend Endpoints Reference

### Register Patient
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

### Login (for future testing)
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ahmad.hassan@example.com",
  "password": "MyPassword123!"
}
```

### Health Check
```
GET http://localhost:5000/health
```

## ✅ Success Indicators

When everything works correctly:

1. **Frontend**:
   - Form validates correctly
   - Success message shows
   - localStorage has: token, user, role
   - Redirects to dashboard

2. **Backend**:
   - Returns 201 status
   - Returns JWT token
   - Returns user and profile data

3. **Database**:
   - New user in `users` collection
   - New patient in `patients` collection
   - Both documents are linked

## 🎯 Next Tests

After successful patient signup, test:
1. [ ] Login with created account
2. [ ] Access patient dashboard
3. [ ] Logout functionality
4. [ ] Password reset
5. [ ] Profile update

---

Happy Testing! 🚀
