const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: null
  },
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String
  }
}, {
  timestamps: true
});

// Index for better search performance
contactSchema.index({ name: 'text', email: 'text', phone: 'text' });
contactSchema.index({ status: 1 });
contactSchema.index({ owner: 1 });
contactSchema.index({ location: 1 });
contactSchema.index({ rating: 1 });

module.exports = mongoose.model('Contact', contactSchema);