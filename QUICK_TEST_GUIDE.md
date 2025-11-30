# Quick Test Guide for Profile Image Upload

## Setup (Already Complete ✓)
1. ✓ Multer installed
2. ✓ Upload middleware created
3. ✓ API endpoints created
4. ✓ ProfileImageUpload component created
5. ✓ All settings pages updated
6. ✓ Server configured
7. ✓ Uploads directory created

## How to Test

### Step 1: Start the Application

**Backend (Already Running):**
```bash
cd server
npm start
```
Server should be running on `http://localhost:5000`

**Frontend:**
```bash
cd client
npm run dev
```
Client should be running on `http://localhost:5173` (or similar)

### Step 2: Test Upload Functionality

1. **Login** to your Dentify account (any role)

2. **Navigate to Settings:**
   - Patient: Dashboard → Settings
   - Dentist: Dashboard → Settings
   - Secretary: Dashboard → Settings
   - Admin: Dashboard → Settings
   - Clinic: Dashboard → Settings
   - Radiology Center: Dashboard → Settings

3. **Upload an Image:**
   - Click the camera icon (📷) on the profile picture placeholder
   - Select an image file from your computer
     - Supported formats: JPEG, PNG, GIF, WebP
     - Maximum size: 5MB
   - The image should upload and display immediately
   - You'll see a success message

4. **Delete an Image:**
   - Hover over your uploaded profile image
   - A trash icon (🗑️) should appear in the top-right corner
   - Click the trash icon
   - Confirm deletion in the alert
   - The image should be removed

### Step 3: Verify Backend

**Check Uploaded Files:**
```bash
# In the server directory
ls uploads/profiles
```
You should see your uploaded image files with names like:
`user-123-1234567890-987654321.jpg`

**Check Database:**
Your user's `profileImage` field should contain the image path:
```
/uploads/profiles/user-123-1234567890-987654321.jpg
```

**Test API Directly (Optional):**

**Upload:**
```bash
curl -X POST http://localhost:5000/api/upload/profile-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profileImage=@/path/to/your/image.jpg"
```

**Delete:**
```bash
curl -X DELETE http://localhost:5000/api/upload/profile-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 4: Test Edge Cases

1. **Large File:** Try uploading a file larger than 5MB (should fail with error)
2. **Wrong Type:** Try uploading a PDF or TXT file (should fail with error)
3. **No Token:** Try API without authentication (should return 401)
4. **Multiple Uploads:** Upload several images in a row (old ones should be deleted)

## Expected Behavior

### ✅ Success Cases
- Image uploads and displays immediately
- Old image is automatically deleted when uploading new one
- Image persists after page refresh
- Image is visible across all pages that display user info
- Delete removes image and reverts to default avatar

### ❌ Error Cases
- Files > 5MB: "Image size must be less than 5MB"
- Non-image files: "Please upload a valid image file"
- Network errors: "Failed to upload image. Please try again."
- Authentication errors: Redirected to login

## Troubleshooting

### Image doesn't upload
1. Check browser console for errors
2. Verify you're logged in (valid JWT token)
3. Check file size and type
4. Verify server is running
5. Check `server/uploads/profiles/` directory exists and has write permissions

### Image doesn't display
1. Check image URL in browser dev tools
2. Verify `http://localhost:5000/uploads/profiles/` is accessible
3. Check database has correct profileImage path
4. Try clearing browser cache
5. Check CORS settings

### Old images aren't deleted
1. Check file system permissions
2. Check server logs for errors
3. Verify file paths match

## Quick Verification Checklist

- [ ] Server starts without errors
- [ ] Client builds without errors
- [ ] Can login successfully
- [ ] Settings page loads
- [ ] Can see camera icon on profile picture
- [ ] Can select image file
- [ ] Image uploads successfully
- [ ] Image displays correctly
- [ ] Can hover and see delete button
- [ ] Can delete image
- [ ] Image persists after refresh
- [ ] Old images are removed from server

## Files Changed

**Backend:**
- `server/middleware/upload.js` - New file
- `server/routes/upload.js` - New file
- `server/index.js` - Updated

**Frontend:**
- `client/src/components/common/ProfileImageUpload.jsx` - New file
- `client/src/components/common/index.js` - Updated
- `client/src/pages/dashboard/patient/PatientSettings.jsx` - Updated
- `client/src/pages/dashboard/dentist/DentistSettings.jsx` - Updated
- `client/src/pages/dashboard/secretary/SecretarySettings.jsx` - Updated
- `client/src/pages/dashboard/admin/AdminSettings.jsx` - Updated
- `client/src/pages/dashboard/clinic/ClinicSettings.jsx` - Updated
- `client/src/pages/dashboard/radiology/RadiologySettings.jsx` - Updated

**New Directories:**
- `server/uploads/profiles/` - For storing uploaded images

## Need Help?

If you encounter any issues:
1. Check the detailed documentation in `PROFILE_IMAGE_UPLOAD.md`
2. Review browser console for JavaScript errors
3. Check server logs for backend errors
4. Verify all dependencies are installed
5. Ensure database schema includes `profileImage` field in User model (already exists in your schema)
