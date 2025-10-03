const mongoose = require('mongoose');
const User = require('./User');

const patientSchema = new mongoose.Schema({
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
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  address: {
    city: {
      type: String,
      required: true,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
patientSchema.index({ 'address.city': 1 });

// Virtual to populate user data
patientSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});



// Static method to create patient with user
patientSchema.statics.createWithUser = async function(userData, patientData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create user with Patient role
    const userDoc = new User({ ...userData, role: 'Patient' });
    await userDoc.save({ session });
    
    // Create patient profile
    const patientDoc = new this({ ...patientData, userId: userDoc._id });
    await patientDoc.save({ session });
    
    await session.commitTransaction();
    return { user: userDoc, patient: patientDoc };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('Patient', patientSchema);