const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    trim: true
  },
  endTime: {
    type: String,
    trim: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0
  },
  billable: {
    type: Boolean,
    default: true
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

timeEntrySchema.index({ companyId: 1,  });
timeEntrySchema.index({ projectId: 1 });
timeEntrySchema.index({ taskId: 1 });
timeEntrySchema.index({ date: 1 });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);