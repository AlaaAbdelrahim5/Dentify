const express = require('express');
const RadiologyCenter = require('../models/RadiologyCenter');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get radiology center statistics (Admin only)
router.get('/stats/overview', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const totalCenters = await RadiologyCenter.countDocuments();
    const activeCenters = await RadiologyCenter.countDocuments({ isActive: true });
    const inactiveCenters = await RadiologyCenter.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        total: totalCenters,
        active: activeCenters,
        inactive: inactiveCenters
      }
    });

  } catch (error) {
    console.error('Get radiology center stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching radiology center statistics'
    });
  }
});

// Get all radiology centers (Admin only)
router.get('/', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (city) {
      filter['address.city'] = city;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get centers with pagination
    const centers = await RadiologyCenter.find(filter)
      .populate('radiologists', 'fullName email')
      .populate('technicians', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await RadiologyCenter.countDocuments(filter);
    
    res.json({
      success: true,
      data: centers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get radiology centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching radiology centers'
    });
  }
});

// Get single radiology center by ID
router.get('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const center = await RadiologyCenter.findById(req.params.id)
      .populate('radiologists', 'fullName email phone')
      .populate('technicians', 'fullName email phone');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Radiology center not found'
      });
    }

    res.json({
      success: true,
      data: center
    });

  } catch (error) {
    console.error('Get radiology center error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching radiology center'
    });
  }
});

// Create new radiology center (Admin only)
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
      equipment,
      description,
      registrationNumber,
      certifications,
      operatingLicense
    } = req.body;

    // Validate required fields
    if (!name || !address?.street || !address?.city || !phone?.number) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and phone number are required'
      });
    }

    // Check if center with same name or registration number exists
    const existingCenter = await RadiologyCenter.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        ...(registrationNumber ? [{ registrationNumber }] : [])
      ]
    });

    if (existingCenter) {
      const field = existingCenter.name.toLowerCase() === name.toLowerCase() ? 'name' : 'registration number';
      return res.status(400).json({
        success: false,
        message: `A radiology center with this ${field} already exists`
      });
    }

    // Create new center
    const center = new RadiologyCenter({
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
      equipment: equipment || [],
      description: description?.trim(),
      registrationNumber: registrationNumber?.trim(),
      certifications: certifications || [],
      operatingLicense
    });

    const savedCenter = await center.save();

    res.status(201).json({
      success: true,
      message: 'Radiology center created successfully',
      data: savedCenter
    });

  } catch (error) {
    console.error('Create radiology center error:', error);
    
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
      message: 'Server error occurred while creating radiology center'
    });
  }
});

// Update radiology center (Admin only)
router.put('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const center = await RadiologyCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Radiology center not found'
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
      equipment,
      description,
      registrationNumber,
      certifications,
      operatingLicense,
      isActive
    } = req.body;

    // Check if another center with same name or registration number exists
    if (name || registrationNumber) {
      const existingCenter = await RadiologyCenter.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(name ? [{ name: { $regex: new RegExp(`^${name}$`, 'i') } }] : []),
          ...(registrationNumber ? [{ registrationNumber }] : [])
        ]
      });

      if (existingCenter) {
        const field = existingCenter.name.toLowerCase() === name?.toLowerCase() ? 'name' : 'registration number';
        return res.status(400).json({
          success: false,
          message: `Another radiology center with this ${field} already exists`
        });
      }
    }

    // Update center fields
    if (name) center.name = name.trim();
    if (address) {
      if (address.street) center.address.street = address.street.trim();
      if (address.city) center.address.city = address.city;
    }
    if (phone) {
      if (phone.countryCode) center.phone.countryCode = phone.countryCode;
      if (phone.number) center.phone.number = phone.number;
    }
    if (workingHours) center.workingHours = workingHours;
    if (email !== undefined) center.email = email?.trim();
    if (website !== undefined) center.website = website;
    if (location) center.location = location;
    if (services !== undefined) center.services = services;
    if (equipment !== undefined) center.equipment = equipment;
    if (description !== undefined) center.description = description?.trim();
    if (registrationNumber !== undefined) center.registrationNumber = registrationNumber?.trim();
    if (certifications !== undefined) center.certifications = certifications;
    if (operatingLicense !== undefined) center.operatingLicense = operatingLicense;
    if (isActive !== undefined) center.isActive = isActive;

    const savedCenter = await center.save();

    res.json({
      success: true,
      message: 'Radiology center updated successfully',
      data: savedCenter
    });

  } catch (error) {
    console.error('Update radiology center error:', error);
    
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
      message: 'Server error occurred while updating radiology center'
    });
  }
});

// Delete radiology center (Admin only)
router.delete('/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const center = await RadiologyCenter.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Radiology center not found'
      });
    }

    await RadiologyCenter.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Radiology center deleted successfully'
    });

  } catch (error) {
    console.error('Delete radiology center error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while deleting radiology center'
    });
  }
});

// Get centers by city (Public)
router.get('/public/by-city/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    const centers = await RadiologyCenter.find({
      'address.city': city,
      isActive: true
    })
    .select('name address phone email website services equipment workingHours')
    .sort({ name: 1 });

    res.json({
      success: true,
      data: centers
    });

  } catch (error) {
    console.error('Get centers by city error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching centers'
    });
  }
});

// Search centers (Public)
router.get('/public/search', async (req, res) => {
  try {
    const { q, city, services } = req.query;
    
    const filter = { isActive: true };
    
    if (q) {
      filter.$text = { $search: q };
    }
    
    if (city) {
      filter['address.city'] = city;
    }
    
    if (services) {
      const serviceArray = services.split(',');
      filter.services = { $in: serviceArray };
    }

    const centers = await RadiologyCenter.find(filter)
      .select('name address phone email website services equipment workingHours')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: centers
    });

  } catch (error) {
    console.error('Search centers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while searching centers'
    });
  }
});

module.exports = router;