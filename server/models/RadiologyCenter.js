const mongoose = require('mongoose');
const User = require('./User');

const radiologyCenterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  centerName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    building: String,
    floor: String,
    apartment: String,
    postalCode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    description: String // Human readable location description
  },
  workingHours: [{
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  }],
  supportedTypes: [{
    name: {
      type: String,
      required: true,
      enum: [
        'Panoramic X-Ray',
        'CBCT (Cone Beam CT)',
        'Intraoral X-Ray',
        'Cephalometric X-Ray',
        'TMJ X-Ray',
        '3D Imaging',
        'Digital X-Ray',
        'Bitewing X-Ray',
        'Periapical X-Ray'
      ]
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    duration: {
      type: Number, // in minutes
      default: 15
    },
    description: String,
    preparationInstructions: String
  }],
  equipment: [{
    name: String,
    model: String,
    manufacturer: String,
    installationDate: Date,
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'out_of_order'],
      default: 'operational'
    }
  }],
  contactInfo: {
    landline: String,
    whatsapp: String,
    website: String,
    emergencyContact: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  facilities: [{
    type: String,
    enum: [
      'Parking Available',
      'Wheelchair Accessible',
      'WiFi Available',
      'Air Conditioning',
      'Lead Aprons Available',
      'Digital Reports',
      'CD/DVD Copies',
      'Online Report Access',
      'Waiting Room',
      'Emergency Services'
    ]
  }],
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  establishedDate: {
    type: Date,
    required: true
  },
  capacity: {
    maxPatientsPerDay: {
      type: Number,
      default: 100
    },
    avgProcessingTime: {
      type: Number, // in hours for report delivery
      default: 24
    }
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  staff: [{
    name: String,
    role: {
      type: String,
      enum: ['Radiologist', 'Technician', 'Receptionist', 'Manager']
    },
    licenseNumber: String,
    specialization: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
radiologyCenterSchema.index({ 'address.city': 1 });
radiologyCenterSchema.index({ 'location': '2dsphere' });
radiologyCenterSchema.index({ 'supportedTypes.name': 1 });
radiologyCenterSchema.index({ 'rating.average': -1 });

// Virtual to populate user data
radiologyCenterSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
radiologyCenterSchema.set('toJSON', { virtuals: true });
radiologyCenterSchema.set('toObject', { virtuals: true });

// Method to check if center is open at a specific time
radiologyCenterSchema.methods.isOpenAt = function(day, time) {
  const daySchedule = this.workingHours.find(schedule => 
    schedule.day === day && schedule.isOpen
  );
  
  if (!daySchedule) return false;
  
  return time >= daySchedule.startTime && time <= daySchedule.endTime;
};

// Method to get service by type
radiologyCenterSchema.methods.getServiceByType = function(typeName) {
  return this.supportedTypes.find(type => type.name === typeName);
};

// Method to check if a specific imaging type is supported
radiologyCenterSchema.methods.supportsType = function(typeName) {
  return this.supportedTypes.some(type => type.name === typeName);
};

// Static method to find centers by imaging type
radiologyCenterSchema.statics.findByType = function(typeName) {
  return this.find({
    'supportedTypes.name': typeName,
    status: 'active'
  });
};

// Static method to find nearby centers
radiologyCenterSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    status: 'active'
  });
};

// Static method to create radiology center with user
radiologyCenterSchema.statics.createWithUser = async function(userData, centerData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create user with RadiologyCenter role
    const userDoc = new User({ ...userData, role: 'RadiologyCenter' });
    await userDoc.save({ session });
    
    // Create radiology center profile
    const centerDoc = new this({ ...centerData, userId: userDoc._id });
    await centerDoc.save({ session });
    
    await session.commitTransaction();
    return { user: userDoc, center: centerDoc };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('RadiologyCenter', radiologyCenterSchema);