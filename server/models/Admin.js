const mongoose = require('mongoose');
const User = require('./User');

const adminSchema = new mongoose.Schema({
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
  permissions: {
    type: [String],
    default: ['manage_users', 'manage_clinics', 'manage_radiology_centers', 'view_reports']
  }
}, {
  timestamps: true
});

// Index is defined inline in the schema

// Virtual to populate user data
adminSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

// Static method to create admin with user
adminSchema.statics.createWithUser = async function(userData, adminData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create user with Admin role
    const userDoc = new User({ ...userData, role: 'Admin' });
    await userDoc.save({ session });
    
    // Create admin profile
    const adminDoc = new this({ ...adminData, userId: userDoc._id });
    await adminDoc.save({ session });
    
    await session.commitTransaction();
    return { user: userDoc, admin: adminDoc };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model('Admin', adminSchema);