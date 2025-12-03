const mongoose = require('mongoose');

const SalesOrderCategorySchema = new mongoose.Schema({
  categoryName: String,
  // prefix: String,
  rangeFrom: String,
  rangeTo: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
},{timestamps: true});

module.exports = mongoose.model('SalesOrderCategory', SalesOrderCategorySchema);
