const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (authenticated users - needed for chat)
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        profileImage: true,
        admin: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        dentist: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        secretary: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        radiology: {
          select: {
            centerName: true
          }
        },
        clinic: {
          select: {
            clinicName: true
          }
        }
      }
    });
    
    // Format the response to include firstName and lastName at root level
    const formattedUsers = users.map(user => {
      const roleData = user.admin || user.dentist || user.secretary || user.patient;
      let displayName = user.email;
      
      if (roleData) {
        displayName = `${roleData.firstName || ''} ${roleData.lastName || ''}`.trim();
      } else if (user.radiology?.centerName) {
        displayName = user.radiology.centerName;
      } else if (user.clinic?.clinicName) {
        displayName = user.clinic.clinicName;
      }
      
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        profileImage: user.profileImage,
        firstName: roleData?.firstName || '',
        lastName: roleData?.lastName || '',
        centerName: user.radiology?.centerName || '',
        clinicName: user.clinic?.clinicName || '',
        name: displayName
      };
    });
    
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await req.prisma.user.findUnique({
      where: { id },
      include: {
        admin: true,
        clinic: true,
        dentist: true,
        secretary: true,
        patient: true,
        radiology: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.password;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone, profileImage } = req.body;

    // Check if user can update (must be own profile or admin)
    if (req.user.id !== id && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await req.prisma.user.update({
      where: { id },
      data: { email, phone, profileImage },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        profileImage: true
      }
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await req.prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Save FCM token
router.post('/fcm-token', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    // Save FCM token to Firebase (if using Firebase for notifications)
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    await db.collection('users').doc(userId.toString()).set({
      fcmToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save FCM token' });
  }
});

module.exports = router;
