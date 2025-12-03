const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  qty: Number,
  baseUnit: String,
  orderUnit: String,
  unit: String,
  price: String
});

const salesContractSchema = new mongoose.Schema({
  contractNumber: { type: String, required: true, unique: true },
  indentId: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleContractCategory' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  note: String,
  validityFromDate: String,
  validityToDate: String,
  salesGroup: String,
  location: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  items: [itemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
salesContractSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SalesContract', salesContractSchema);