const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\S+@\S+\.\S+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  phone: {
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
      default: '+970'
    },
    number: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(phone) {
          return /^\d{7,}$/.test(phone);
        },
        message: 'Phone number must contain at least 7 digits'
      }
    },
    full: {
      type: String,
      required: true
    }
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(date) {
        const today = new Date();
        const birthDate = new Date(date);
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 0 && age <= 120;
      },
      message: 'Please provide a valid date of birth'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    enum: {
      values: [
        'acre', 'al_bireh', 'beersheba', 'beit_hanoun', 'beit_jala', 'beit_lahia',
        'beit_sahour', 'bethlehem', 'deir_al_balah', 'gaza', 'haifa', 'hebron',
        'jabalya', 'jaffa', 'jenin', 'jericho', 'jerusalem', 'khan_yunis', 'lydd',
        'nablus', 'nazareth', 'qalqilya', 'rafah', 'ramallah', 'ramla', 'safad',
        'salfit', 'tiberias', 'tubas', 'tulkarm'
      ],
      message: 'Please select a valid city'
    }
  },
  role: {
    type: String,
    enum: ['patient', 'dentist', 'admin'],
    default: 'patient'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  profile: {
    avatar: String,
    bio: String,
    preferences: {
      language: {
        type: String,
        enum: ['en', 'ar'],
        default: 'en'
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true }
      }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get age from date of birth
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Transform output to remove sensitive fields
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create indexes for better performance
userSchema.index({ 'phone.full': 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;