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
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String, // Can be coordinates or text description
    required: true
  },
  description: {
    type: String,
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
    }
  }],
  supportedTypes: [{
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
  }]
}, {
  timestamps: true
});

// Indexes
radiologyCenterSchema.index({ city: 1 });
radiologyCenterSchema.index({ supportedTypes: 1 });

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