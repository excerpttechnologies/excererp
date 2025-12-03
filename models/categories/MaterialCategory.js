const mongoose = require('mongoose');

const materialCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  // prefix: { type: String, required: true },
  rangeStart: { type: Number, required: true },
  rangeEnd: { type: Number, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,

}, { timestamps: true });

// Change model name here to 'MaterialCategory'
module.exports = mongoose.model('MaterialCategory', materialCategorySchema);

