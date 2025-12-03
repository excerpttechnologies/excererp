const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  milestoneName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Delayed', 'Cancelled'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  deliverables: [{
    type: String,
    trim: true
  }],
  budget: {
    type: Number,
    default: 0
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
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

milestoneSchema.index({ companyId: 1,  });
milestoneSchema.index({ projectId: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);