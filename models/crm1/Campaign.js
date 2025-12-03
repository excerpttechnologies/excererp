const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  campaignName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  campaignType: {
    type: String,
    required: true,
    enum: ['Email', 'Social Media', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Print', 'TV/Radio', 'Event', 'Influencer', 'SEO', 'Other']
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Active', 'Paused', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  budget: {
    type: Number,
    default: 0
  },
  targetAudience: {
    type: String,
    trim: true
  },
  channels: [{
    type: String,
    trim: true
  }],
  objectives: [{
    type: String,
    trim: true
  }],
  expectedROI: {
    type: Number,
    default: 0
  },
  actualROI: {
    type: Number,
    default: 0
  },
  leads: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  clickThroughRate: {
    type: Number,
    default: 0
  },
  openRate: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
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

campaignSchema.index({ companyId: 1,  });
campaignSchema.index({ status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);