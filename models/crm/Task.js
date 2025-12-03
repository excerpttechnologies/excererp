// const mongoose = require('mongoose');

// const taskSchema = new mongoose.Schema({
//   taskName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true,
//     default: ''
//   },
//   projectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Project',
//     required: true
//   },
//   assignedTo: {
//     type: String,
//     trim: true
//   },
//   status: {
//     type: String,
//     enum: ['To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Blocked'],
//     default: 'To Do'
//   },
//   priority: {
//     type: String,
//     enum: ['Low', 'Medium', 'High', 'Critical'],
//     default: 'Medium'
//   },
//   dueDate: {
//     type: Date
//   },
//   estimatedHours: {
//     type: Number,
//     default: 0
//   },
//   actualHours: {
//     type: Number,
//     default: 0
//   },
//   category: {
//     type: String,
//     enum: ['Development', 'Testing', 'Design', 'Documentation', 'Bug Fix', 'Research', 'Other']
//   },
//   companyId: {
//     type: String,
//     required: true
//   },
//   financialYear: {
//     type: String,
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// taskSchema.index({ companyId: 1,  });
// taskSchema.index({ projectId: 1 });

// module.exports = mongoose.model('Task', taskSchema);

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // Changed from String to Array of ObjectIds to support multiple assignees
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee' // Assuming you have an Employee model
  }],
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Blocked'],
    default: 'To Do'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['Development', 'Testing', 'Design', 'Documentation', 'Bug Fix', 'Research', 'Other']
  },
  dueDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  companyId: {
    type: String,
    required: true
  },
  financialYear: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ companyId: 1,  });
taskSchema.index({ projectId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);