const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
  industryName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Technology',
      'Healthcare', 
      'Finance',
      'Manufacturing',
      'Retail',
      'Education',
      'Real Estate',
      'Transportation',
      'Energy',
      'Media',
      'Hospitality',
      'Construction',
      'Agriculture',
      'Other'
    ]
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  companyId: {
    type: String,
    required: true
  },
  financialYear: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

industrySchema.index({ companyId: 1 });

module.exports = mongoose.model('Industry', industrySchema);