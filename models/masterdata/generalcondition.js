const mongoose = require('mongoose');

const generalConditionSchema = new mongoose.Schema({
  name: String,
  description: String,
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('GeneralCondition', generalConditionSchema);
