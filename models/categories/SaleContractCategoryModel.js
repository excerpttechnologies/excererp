const mongoose = require('mongoose');

const saleContractCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  // prefix: { type: String, required: true },
  rangeFrom: { type: Number, required: true },
  rangeTo: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
   companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    financialYear: String,
});

// Update the updatedAt field before saving
saleContractCategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SaleContractCategory', saleContractCategorySchema);