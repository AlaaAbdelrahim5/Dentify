const mongoose = require('mongoose');
const User = require('./User');

const secretarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  address: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    street: String,
    building: String
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
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
  permissions: {
    type: [String],
    default: [
      'manage_appointments',
      'view_patient_basic_info',
      'manage_clinic_schedule',
      'send_notifications'
    ]
  },
  salary: {
    type: Number,
    min: 0
  },
  hireDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
secretarySchema.index({ clinicId: 1 });
secretarySchema.index({ 'address.city': 1 });

// Virtual to populate user data
secretarySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate clinic data
secretarySchema.virtual('clinic', {
  ref: 'Clinic',
  localField: 'clinicId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
secretarySchema.set('toJSON', { virtuals: true });
secretarySchema.set('toObject', { virtuals: true });

// Virtual for full name
secretarySchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
secretarySchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Static method to create secretary with user
secretarySchema.statics.createWithUser = async function(userData, secretaryData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create user with Secretary role
    const userDoc = new User({ ...userData, role: 'Secretary' });
    await userDoc.save({ session });
    
    // Create secretary profile
    const secretaryDoc = new this({ ...secretaryData, userId: userDoc._id });
    await secretaryDoc.save({ session });
    
    await session.commitTransaction();
    return { user: userDoc, secretary: secretaryDoc };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('Secretary', secretarySchema);