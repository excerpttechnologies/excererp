const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  processId: String,
  processDescription: String,
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Process', processSchema);
