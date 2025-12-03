const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  clientName: { 
    type: String,
    required: true,
    trim: true
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
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Planning'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  projectManager: [{
    type: mongoose.Schema.Types.ObjectId,
       ref: "Employee",
       required: true
  }],
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
       ref: "Employee",
       required: true
  }],
  technologies: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Web Development', 'Mobile App', 'Desktop App', 'API Development', 'Data Analysis', 'Other']
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

projectSchema.index({ companyId: 1 });

module.exports = mongoose.model('Project', projectSchema);