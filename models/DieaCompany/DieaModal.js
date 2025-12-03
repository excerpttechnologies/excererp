const mongoose = require('mongoose');

const dieaCompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  previousBalance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
// Static method to generate next invoice number


module.exports = mongoose.model('CompanyDiea', dieaCompanySchema);