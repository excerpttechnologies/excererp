const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  designName: {
    type: String,
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
});

module.exports = mongoose.model('Designation', designationSchema);
