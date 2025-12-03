const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  category: { type: String, required: true },
  catdesc: { type: String },
  docnumber: { type: String, unique: true, required: true },
  documentDate: { type: String, required: true },
  postingDate: { type: String, required: true },
  reference: { type: String },
  BillingRef: { type: String },
  customer: { type: String },
  location: { type: String },
  receiptDate: { type: String },
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  items: [
    {
      materialId: String,
      description: String,
      quantity: Number,
      baseUnit: String,
      deliveryDate: String,
      lotNo: String,
      price: Number,
      hsnNo: String, // Added HSN number field
      priceUnit: String,

    }
  ],
  taxCode: String,
  taxName: String,
  cgst: Number,
  sgst: Number,
  igst: Number,
  totalAmount: Number,
  discount: Number,
  netAmount: Number,
  finalTotal: Number,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  balance: Number
}, { timestamps: true });

module.exports = mongoose.model('Billing', BillingSchema);
