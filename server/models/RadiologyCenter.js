const mongoose = require('mongoose');

const radiologyCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Center name is required'],
    trim: true,
    minlength: [2, 'Center name must be at least 2 characters'],
    maxlength: [100, 'Center name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
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
    fullAddress: {
      type: String
    }
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
      type: String
    }
  },
  workingHours: {
    sunday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    monday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    friday: {
      isOpen: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },
  email: {
    type: String,
    validate: {
      validator: function(email) {
        return !email || /^\S+@\S+\.\S+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  website: {
    type: String,
    validate: {
      validator: function(url) {
        return !url || /^https?:\/\/.+/.test(url);
      },
      message: 'Please provide a valid website URL'
    }
  },
  logo: {
    type: String, // URL to logo image
    default: null
  },
  location: {
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    address: String
  },
  services: [{
    type: String,
    enum: [
      'panoramic_xray',
      'periapical_xray', 
      'bitewing_xray',
      'cephalometric_xray',
      'ct_scan',
      'cbct',
      'mri',
      'ultrasound',
      'digital_imaging',
      'tmj_imaging'
    ]
  }],
  equipment: [{
    type: String,
    enum: [
      'digital_xray_machine',
      'panoramic_machine',
      'cephalometric_machine',
      'cbct_scanner',
      'ct_scanner',
      'mri_machine',
      'ultrasound_machine',
      'intraoral_camera',
      'film_processor',
      'lead_aprons'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  operatingLicense: {
    number: String,
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String
  },
  radiologists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  technicians: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Create full address before saving
radiologyCenterSchema.pre('save', function(next) {
  if (this.address && this.address.street && this.address.city) {
    this.address.fullAddress = `${this.address.street}, ${this.address.city}`;
  }
  
  if (this.phone && this.phone.countryCode && this.phone.number) {
    this.phone.full = `${this.phone.countryCode}${this.phone.number}`;
  }
  
  next();
});

// Virtual for formatted working hours
radiologyCenterSchema.virtual('formattedWorkingHours').get(function() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return days.map((day, index) => ({
    day: dayNames[index],
    ...this.workingHours[day]
  }));
});

// Instance method to check if center is open now
radiologyCenterSchema.methods.isOpenNow = function() {
  const now = new Date();
  const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.workingHours[currentDay];
  
  if (!todayHours.isOpen) return false;
  
  return currentTime >= todayHours.start && currentTime <= todayHours.end;
};

// Index for search
radiologyCenterSchema.index({ name: 'text', 'address.city': 'text', description: 'text' });

module.exports = mongoose.model('RadiologyCenter', radiologyCenterSchema);