# Profile Image Upload Feature

## Overview
This feature allows users to upload, display, and delete profile images for all user roles in the Dentify application.

## Implementation Details

### Server-Side (Backend)

#### 1. Dependencies
- **multer**: Handles file uploads
- **fs**: File system operations for managing uploaded files

#### 2. Upload Configuration (`server/middleware/upload.js`)
- **Storage**: Files are saved to `server/uploads/profiles/` directory
- **Filename Format**: `user-{userId}-{timestamp}-{randomNumber}.{extension}`
- **Allowed File Types**: JPEG, JPG, PNG, GIF, WebP
- **File Size Limit**: 5MB maximum
- **Validation**: Only image files are accepted

#### 3. API Endpoints (`server/routes/upload.js`)

##### Upload Profile Image
```http
POST /api/upload/profile-image
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- profileImage: File (required)
- oldImageUrl: String (optional) - URL of old image to delete
```

**Response:**
```json
{
  "message": "Profile image uploaded successfully",
  "imageUrl": "/uploads/profiles/user-123-1234567890.jpg",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "role": "Patient",
    "profileImage": "/uploads/profiles/user-123-1234567890.jpg"
  }
}
```

##### Delete Profile Image
```http
DELETE /api/upload/profile-image
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Profile image deleted successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "role": "Patient",
    "profileImage": null
  }
}
```

#### 4. Database Integration
- Profile images are stored in the `User.profileImage` field in the database
- The field stores the relative URL path (e.g., `/uploads/profiles/filename.jpg`)
- Old images are automatically deleted when a new image is uploaded

#### 5. Static File Serving
Images are served through Express static middleware:
```javascript
app.use('/uploads', express.static('uploads'))
```

Access images at: `http://localhost:5000/uploads/profiles/{filename}`

### Client-Side (Frontend)

#### 1. ProfileImageUpload Component (`client/src/components/common/ProfileImageUpload.jsx`)

**Features:**
- Image preview before and after upload
- Drag and drop support (via file input click)
- Delete image functionality (hover to reveal delete button)
- Real-time upload progress feedback
- Client-side validation (file type and size)
- Automatic fallback to default avatar if no image

**Props:**
```javascript
{
  currentImage: String,      // Current image URL
  onImageUpdate: Function,   // Callback when image is updated
  userName: String           // Display name for the profile
}
```

**Usage Example:**
```jsx
<ProfileImageUpload 
  currentImage={profile.profileImage}
  onImageUpdate={(imageUrl) => {
    setProfile(prev => ({ ...prev, profileImage: imageUrl }))
  }}
  userName={`${profile.firstName} ${profile.lastName}`}
/>
```

#### 2. Integration in Settings Pages

The component has been integrated into all settings pages:
- **PatientSettings**: `client/src/pages/dashboard/patient/PatientSettings.jsx`
- **DentistSettings**: `client/src/pages/dashboard/dentist/DentistSettings.jsx`
- **SecretarySettings**: `client/src/pages/dashboard/secretary/SecretarySettings.jsx`
- **AdminSettings**: `client/src/pages/dashboard/admin/AdminSettings.jsx`
- **ClinicSettings**: `client/src/pages/dashboard/clinic/ClinicSettings.jsx`
- **RadiologySettings**: `client/src/pages/dashboard/radiology/RadiologySettings.jsx`

Each settings page:
1. Imports the `ProfileImageUpload` component
2. Adds `profileImage` field to the profile state
3. Fetches and displays the current profile image
4. Updates local state when image changes

## Security Considerations

1. **Authentication Required**: All upload/delete operations require valid JWT token
2. **File Type Validation**: Only image files are accepted
3. **File Size Limit**: Maximum 5MB to prevent abuse
4. **User Authorization**: Users can only upload/delete their own profile images
5. **File System Protection**: Uploaded files are stored outside the web root with controlled access

## Error Handling

### Server-Side Errors
- Invalid file type → 400 Bad Request
- File too large → 400 Bad Request
- No file uploaded → 400 Bad Request
- Authentication failure → 401 Unauthorized
- Database update failure → 500 Internal Server Error

### Client-Side Errors
- Invalid file type → Alert with error message
- File too large → Alert with error message
- Network error → Alert with fallback message
- Upload failure → Reverts to previous image

## Testing the Feature

### 1. Start the Backend
```bash
cd server
npm start
```

### 2. Start the Frontend
```bash
cd client
npm run dev
```

### 3. Test Upload Flow
1. Log in to the application
2. Navigate to Settings page
3. Click the camera icon on the profile picture
4. Select an image file (JPEG, PNG, GIF, or WebP)
5. Image should upload and display immediately

### 4. Test Delete Flow
1. Hover over an existing profile image
2. Click the trash icon that appears
3. Confirm deletion
4. Image should be removed

## File Structure

```
server/
├── middleware/
│   └── upload.js              # Multer configuration
├── routes/
│   └── upload.js              # Upload API endpoints
├── uploads/
│   └── profiles/              # Uploaded profile images
└── index.js                   # Server setup with static file serving

client/
└── src/
    └── components/
        └── common/
            └── ProfileImageUpload.jsx  # Reusable upload component
```

## Future Enhancements

1. **Image Optimization**: Resize images on upload to reduce storage
2. **Cloud Storage**: Integrate with AWS S3 or similar services
3. **Image Cropping**: Allow users to crop images before upload
4. **Multiple Images**: Support for gallery or additional images
5. **Progress Bar**: Show upload progress for large files
6. **Thumbnail Generation**: Create thumbnails for different sizes

## Troubleshooting

### Images not uploading
- Check if `server/uploads/profiles/` directory exists
- Verify file permissions on the uploads directory
- Check browser console for JavaScript errors
- Verify JWT token is valid

### Images not displaying
- Check if static file serving is configured correctly
- Verify image URL path in database
- Check browser network tab for 404 errors
- Ensure CORS is properly configured

### Old images not being deleted
- Check file system permissions
- Verify file paths are correct
- Check server logs for deletion errors
