const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload profile image
router.post('/profile-image', authenticate, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.id;
    
    // Convert buffer to base64 data URI
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Update user's profileImage in database with base64 string
    const updatedUser = await req.prisma.user.update({
      where: { id: userId },
      data: { profileImage: base64Image },
      select: {
        id: true,
        email: true,
        role: true,
        profileImage: true
      }
    });

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: base64Image,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Delete profile image
router.delete('/profile-image', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user to check if they have a profile image
    const user = await req.prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true }
    });

    if (!user || !user.profileImage) {
      return res.status(404).json({ error: 'No profile image found' });
    }

    // Update database - remove the base64 image
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
    res.status(500).json({ error: 'Failed to delete profile image' });
  }
});

module.exports = router;
