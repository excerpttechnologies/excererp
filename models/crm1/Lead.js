// const mongoose = require('mongoose');

// const leadSchema = new mongoose.Schema({
//   companyName: {
//     type: String,
//     required: [true, 'Company name is required'],
//     trim: true,
//     maxLength: [100, 'Company name cannot exceed 100 characters']
//   },
//   contactPersonName: {
//     type: String,
//     required: [true, 'Contact person name is required'],
//     trim: true,
//     maxLength: [50, 'Contact person name cannot exceed 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
//   },
//   phoneNumber: {
//     type: String,
//     required: [true, 'Phone number is required'],
//     trim: true,
//     match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
//   },
//   leadSource: {
//     type: String,
//     enum: ['Website', 'Social Media', 'Referral', 'Cold Call', 'Advertisement'],
//     default: 'Website'
//   },
//   leadStatus: {
//     type: String,
//     enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
//     default: 'New'
//   },
//   industry: {
//     type: String,
//     enum: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other'],
//     default: 'Technology'
//   },
//   companySize: {
//     type: String,
//     enum: ['1-10', '11-50', '51-200', '201-1000', '1000+'],
//     default: '1-10'
//   },
//   annualRevenue: {
//     type: Number,
//     min: [0, 'Annual revenue cannot be negative']
//   },
//   leadScore: {
//     type: Number,
//     min: [1, 'Lead score must be at least 1'],
//     max: [100, 'Lead score cannot exceed 100'],
//     default: 50
//   },
//   assignedSalesRep: {
//     type: String,
//     trim: true,
//     maxLength: [50, 'Sales rep name cannot exceed 50 characters']
//   },
//   notes: {
//     type: String,
//     maxLength: [1000, 'Notes cannot exceed 1000 characters']
//   },
//   expectedDealValue: {
//     type: Number,
//     min: [0, 'Expected deal value cannot be negative']
//   },
//   expectedCloseDate: {
//     type: Date,
//     validate: {
//       validator: function(date) {
//         return !date || date >= new Date();
//       },
//       message: 'Expected close date cannot be in the past'
//     }
//   }
// }, {
//   timestamps: true,
//   toJSON: { virtuals: true },
//   toObject: { virtuals: true }
// });

// // Indexes for better query performance
// leadSchema.index({ email: 1 });
// leadSchema.index({ leadStatus: 1 });
// leadSchema.index({ companyName: 1 });
// leadSchema.index({ createdAt: -1 });

// // Virtual for lead age
// leadSchema.virtual('leadAge').get(function() {
//   return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
// });

// // Pre-save middleware
// leadSchema.pre('save', function(next) {
//   if (this.isModified('email')) {
//     this.email = this.email.toLowerCase();
//   }
//   next();
// });

// // Static method to get leads by status
// leadSchema.statics.getLeadsByStatus = function(status) {
//   return this.find({ leadStatus: status });
// };

// // Instance method to update lead status
// leadSchema.methods.updateStatus = function(newStatus) {
//   this.leadStatus = newStatus;
//   return this.save();
// };

// module.exports = mongoose.model('Lead', leadSchema);


const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPersonName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  leadSource: {
    type: String,
    required: true,
    enum: ['Website', 'Social Media', 'Referral', 'Cold Call', 'Advertisement', 'Email Campaign', 'Google Ads', 'Event', 'Other']
  },
  leadStatus: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New'
  },
  industry: {
    type: String,
    required: true,
    enum: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other']
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-1000', '1000+'],
    default: '1-10'
  },
  annualRevenue: {
    type: Number,
    default: 0
  },
  leadScore: {
    type: Number,
    min: 1,
    max: 100,
    default: 50
  },
  assignedSalesRep: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  expectedDealValue: {
    type: Number,
    default: 0
  },
  expectedCloseDate: {
    type: Date
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
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

leadSchema.index({ companyId: 1,  });
leadSchema.index({ email: 1 });
leadSchema.index({ campaignId: 1 });
leadSchema.index({ leadStatus: 1 });
leadSchema.index({ leadScore: -1 });

module.exports = mongoose.model('Lead', leadSchema);