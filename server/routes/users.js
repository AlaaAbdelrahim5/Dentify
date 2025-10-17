const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticate, authorize('Admin'), async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        profileImage: true
      }
    });
    res.json({ users });
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

module.exports = router;
