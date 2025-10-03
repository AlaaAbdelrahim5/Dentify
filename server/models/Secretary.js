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
    }
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: true
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