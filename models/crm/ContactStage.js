const mongoose = require('mongoose');

const contactStageSchema = new mongoose.Schema({
  stageName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    required: true
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  color: {
    type: String,
    default: '#007bff'
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

contactStageSchema.index({ companyId: 1, order: 1 });

module.exports = mongoose.model('ContactStage', contactStageSchema);