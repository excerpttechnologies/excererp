const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  category: { type: String, required: true },
  catdesc: { type: String },
  docnumber: { type: String, unique: true, required: true },
  documentDate: { type: String, required: true },
  postingDate: { type: String, required: true },
  reference: { type: String },
  invoiceRef: { type: String },
  vendor: { type: String },
  location: { type: String },
  receiptDate: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
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
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: { type: String },
  totalAmount: Number,
  discount: Number,
  netAmount: Number,
  finalTotal: Number,
  balance: Number
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
