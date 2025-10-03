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
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
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
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  servicesAvailable: [{
    type: String,
    required: true
  }],
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
  dentists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dentist'
  }],
  secretaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Secretary'
  }]
}, {
  timestamps: true
});

// Indexes
clinicSchema.index({ city: 1 });

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