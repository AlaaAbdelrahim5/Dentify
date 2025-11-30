const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Upload profile image
router.post('/profile-image', authenticate, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    // Update user's profileImage in database
    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
      select: {
        id: true,
        email: true,
        role: true,
        profileImage: true
      }
    });

    // Delete old profile image if it exists
    const oldImagePath = req.body.oldImageUrl;
    if (oldImagePath && oldImagePath !== imageUrl) {
      const oldFilePath = path.join(__dirname, '..', oldImagePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    // Clean up uploaded file if database update fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Delete profile image
router.delete('/profile-image', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user to find their profile image
    const user = await req.prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true }
    });

    if (!user || !user.profileImage) {
      return res.status(404).json({ error: 'No profile image found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', user.profileImage);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update database
    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
      select: {
        id: true,
        email: true,
        role: true,
        profileImage: true
      }
    });

    res.json({
      message: 'Profile image deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ error: 'Failed to delete profile image' });
  }
});

module.exports = router;
