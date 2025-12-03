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

const salesQuotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, required: true, unique: true },
  indentId: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SaleQuotationCategory' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  note: String,
  validityDate: String,
  salesGroup: String,
  location: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  items: [itemSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SalesQuotation', salesQuotationSchema);
