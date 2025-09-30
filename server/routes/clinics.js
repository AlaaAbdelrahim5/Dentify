const express = require('express');
const Clinic = require('../models/Clinic');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all clinics (Admin only)
router.get('/', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      // Use regex for partial matching instead of text search
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.fullAddress': { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (city) {
      filter['address.city'] = city;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get clinics with pagination
    const clinics = await Clinic.find(filter)
      .populate('doctors', 'fullName email')
      .populate('secretaries', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Clinic.countDocuments(filter);
    
    res.json({
      success: true,
      data: clinics,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get clinics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching clinics'
    });
  }
});

// Get single clinic by ID
router.get('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .populate('doctors', 'fullName email phone')
      .populate('secretaries', 'fullName email phone');

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    res.json({
      success: true,
      data: clinic
    });

  } catch (error) {
    console.error('Get clinic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching clinic'
    });
  }
});

// Create new clinic (Admin only)
router.post('/', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      workingHours,
      email,
      website,
      location,
      services,
      description,
      registrationNumber
    } = req.body;

    // Validate required fields
    if (!name || !address?.street || !address?.city || !phone?.number) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and phone number are required'
      });
    }

    // Check if clinic with same name or registration number exists
    const existingClinic = await Clinic.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        ...(registrationNumber ? [{ registrationNumber }] : [])
      ]
    });

    if (existingClinic) {
      const field = existingClinic.name.toLowerCase() === name.toLowerCase() ? 'name' : 'registration number';
      return res.status(400).json({
        success: false,
        message: `A clinic with this ${field} already exists`
      });
    }

    // Create new clinic
    const clinic = new Clinic({
      name: name.trim(),
      address: {
        street: address.street.trim(),
        city: address.city
      },
      phone: {
        countryCode: phone.countryCode || '+970',
        number: phone.number
      },
      workingHours: workingHours || undefined,
      email: email?.trim(),
      website,
      location,
      services: services || [],
      description: description?.trim(),
      registrationNumber: registrationNumber?.trim()
    });

    const savedClinic = await clinic.save();

    res.status(201).json({
      success: true,
      message: 'Clinic created successfully',
      data: savedClinic
    });

  } catch (error) {
    console.error('Create clinic error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error occurred while creating clinic'
    });
  }
});

// Update clinic (Admin only)
router.put('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    const {
      name,
      address,
      phone,
      workingHours,
      email,
      website,
      location,
      services,
      description,
      registrationNumber,
      isActive
    } = req.body;

    // Check for duplicate name or registration number (excluding current clinic)
    if (name || registrationNumber) {
      const duplicateCheck = await Clinic.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(name ? [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }] : []),
          ...(registrationNumber ? [{ registrationNumber }] : [])
        ]
      });

      if (duplicateCheck) {
        const field = duplicateCheck.name.toLowerCase() === name?.toLowerCase() ? 'name' : 'registration number';
        return res.status(400).json({
          success: false,
          message: `A clinic with this ${field} already exists`
        });
      }
    }

    // Update fields
    if (name) clinic.name = name.trim();
    if (address) {
      if (address.street) clinic.address.street = address.street.trim();
      if (address.city) clinic.address.city = address.city;
    }
    if (phone) {
      if (phone.countryCode) clinic.phone.countryCode = phone.countryCode;
      if (phone.number) clinic.phone.number = phone.number;
    }
    if (workingHours) clinic.workingHours = workingHours;
    if (email !== undefined) clinic.email = email?.trim();
    if (website !== undefined) clinic.website = website;
    if (location) clinic.location = location;
    if (services) clinic.services = services;
    if (description !== undefined) clinic.description = description?.trim();
    if (registrationNumber !== undefined) clinic.registrationNumber = registrationNumber?.trim();
    if (isActive !== undefined) clinic.isActive = isActive;

    const updatedClinic = await clinic.save();

    res.json({
      success: true,
      message: 'Clinic updated successfully',
      data: updatedClinic
    });

  } catch (error) {
    console.error('Update clinic error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error occurred while updating clinic'
    });
  }
});

// Delete clinic (Admin only)
router.delete('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: 'Clinic not found'
      });
    }

    // Soft delete - just deactivate
    clinic.isActive = false;
    await clinic.save();

    res.json({
      success: true,
      message: 'Clinic deactivated successfully'
    });

  } catch (error) {
    console.error('Delete clinic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while deleting clinic'
    });
  }
});

// Get clinic statistics (Admin only)
router.get('/stats/overview', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const totalClinics = await Clinic.countDocuments();
    const activeClinics = await Clinic.countDocuments({ isActive: true });
    const inactiveClinics = await Clinic.countDocuments({ isActive: false });
    
    // Get clinics by city
    const clinicsByCity = await Clinic.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalClinics,
        active: activeClinics,
        inactive: inactiveClinics,
        byCity: clinicsByCity
      }
    });

  } catch (error) {
    console.error('Get clinic stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching clinic statistics'
    });
  }
});

module.exports = router;