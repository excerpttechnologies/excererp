const mongoose = require('mongoose');

const customerPriceListSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCategory', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  unit: { type: String, required: true },
  bum: { type: Number, required: true },
  price: { type: Number, required: true, min: 0 }, // Added price field
  contactperson: { type: String, required: true },
  contactnumber: String,
  salesGroup: { type: String, required: true },
  taxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', default: null },
  tandc: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String
}, { timestamps: true });

module.exports = mongoose.model('CustomerPriceList', customerPriceListSchema);