const mongoose = require('mongoose');

const goodsIssueCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  // prefix: { type: String, required: true },
  rangeStart: { type: Number, required: true },
  rangeEnd: { type: Number, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,

}, { timestamps: true });

module.exports = mongoose.model('GoodsIssueCategory', goodsIssueCategorySchema);
