const mongoose = require('mongoose');
const User = require('./User');

const clinicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  clinicName: {
    type: String,
    required: true,
    trim: true
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
  servicesAvailable: [{
    name: {
      type: String,
      required: true,
      enum: [
        'General Consultation',
        'Teeth Cleaning',
        'Tooth Extraction',
        'Root Canal Treatment',
        'Dental Filling',
        'Crown and Bridge',
        'Dental Implants',
        'Orthodontic Treatment',
        'Teeth Whitening',
        'Periodontal Treatment',
        'Oral Surgery',
        'Pediatric Dentistry',
        'Cosmetic Dentistry',
        'Emergency Treatment'
      ]
    },
    price: {
      type: Number,
      min: 0
    },
    duration: {
      type: Number, // in minutes
      default: 30
    },
    description: String
  }],
  dentists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dentist'
  }],
  secretaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Secretary'
  }],
  contactInfo: {
    landline: String,
    whatsapp: String,
    website: String,
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
      'X-Ray Equipment',
      'Sterilization Equipment',
      'Emergency Equipment',
      'Kids Play Area',
      'Waiting Room',
      'Private Rooms'
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
      default: 50
    },
    numberOfChairs: {
      type: Number,
      default: 2
    }
  },
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
clinicSchema.index({ 'address.city': 1 });
clinicSchema.index({ 'location': '2dsphere' });
clinicSchema.index({ 'servicesAvailable.name': 1 });
clinicSchema.index({ 'rating.average': -1 });

// Virtual to populate user data
clinicSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
clinicSchema.set('toJSON', { virtuals: true });
clinicSchema.set('toObject', { virtuals: true });

// Method to check if clinic is open at a specific time
clinicSchema.methods.isOpenAt = function(day, time) {
  const daySchedule = this.workingHours.find(schedule => 
    schedule.day === day && schedule.isOpen
  );
  
  if (!daySchedule) return false;
  
  return time >= daySchedule.startTime && time <= daySchedule.endTime;
};

// Method to get available services by name
clinicSchema.methods.getServiceByName = function(serviceName) {
  return this.servicesAvailable.find(service => service.name === serviceName);
};

// Static method to find clinics by service
clinicSchema.statics.findByService = function(serviceName) {
  return this.find({
    'servicesAvailable.name': serviceName,
    status: 'active'
  });
};

// Static method to find nearby clinics
clinicSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
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

// Static method to create clinic with user
clinicSchema.statics.createWithUser = async function(userData, clinicData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create user with Clinic role
    const userDoc = new User({ ...userData, role: 'Clinic' });
    await userDoc.save({ session });
    
    // Create clinic profile
    const clinicDoc = new this({ ...clinicData, userId: userDoc._id });
    await clinicDoc.save({ session });
    
    await session.commitTransaction();
    return { user: userDoc, clinic: clinicDoc };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('Clinic', clinicSchema);