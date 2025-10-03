const mongoose = require('mongoose');
const User = require('./User');

const dentistSchema = new mongoose.Schema({
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
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  specialization: {
    type: [String],
    required: true,
    enum: [
      'General Dentistry',
      'Orthodontics',
      'Endodontics',
      'Periodontics',
      'Oral Surgery',
      'Prosthodontics',
      'Pediatric Dentistry',
      'Oral Pathology',
      'Cosmetic Dentistry',
      'Implantology'
    ]
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
    }
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
  appointmentDuration: {
    type: Number,
    required: true,
    default: 30, // in minutes
    min: 15,
    max: 120
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    whatsapp: String,
    tiktok: String
  }
}, {
  timestamps: true
});

// Indexes
dentistSchema.index({ clinicId: 1 });
dentistSchema.index({ specialization: 1 });
dentistSchema.index({ 'address.city': 1 });

// Virtual to populate user data
dentistSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate clinic data
dentistSchema.virtual('clinic', {
  ref: 'Clinic',
  localField: 'clinicId',
  foreignField: '_id',
  justOne: true
});

// Virtual for full name
dentistSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
dentistSchema.set('toJSON', { virtuals: true });
dentistSchema.set('toObject', { virtuals: true });



// Static method to create dentist with user
dentistSchema.statics.createWithUser = async function(userData, dentistData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create user with Dentist role
    const userDoc = new User({ ...userData, role: 'Dentist' });
    await userDoc.save({ session });
    
    // Create dentist profile
    const dentistDoc = new this({ ...dentistData, userId: userDoc._id });
    await dentistDoc.save({ session });
    
    await session.commitTransaction();
    return { user: userDoc, dentist: dentistDoc };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('Dentist', dentistSchema);