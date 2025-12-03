const mongoose = require('mongoose');

const QuotationItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  qty: Number,
  baseUnit: String,
  orderUnit: String,
  unit: String,
  vendorId: String,
  vendorName: String,
  materialgroup: String,
  deliveryDate: Date,
  price: Number
});

const QuotationSchema = new mongoose.Schema({
  quotationNumber: { type: String, unique: true },
  indentId: String,
  categoryId: String,
  rfqCategoryId: String,
  vendor: String,
  vendorName: String,
  quotationReference: String, // New field for quotation reference
  vnNo: String,
  validityDate: Date,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  note: String,
  location: String,
  buyerGroup: String,
  totalPrice: { type: Number, default: 0 }, // New field for total price
  items: [QuotationItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quotation', QuotationSchema);