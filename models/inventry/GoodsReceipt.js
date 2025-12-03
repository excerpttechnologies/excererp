const mongoose = require('mongoose');

const GoodsReceiptSchema = new mongoose.Schema({
  category: { type: String, required: true },
  catdesc: { type: String },
  docnumber: { type: String, unique: true, required: true },
  documentDate: { type: String, required: true },
  postingDate: { type: String, required: true },
  reference: { type: String },
  vendor: { type: String },
  location: { type: String },
  receiptDate: { type: String },
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  isdelete: { type: Boolean, default: false },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: { type: String },
  items: [
    {
      materialId: String,
      description: String,
      quantity: Number,
      baseUnit: String,
      deliveryDate: String,
      lotNo: String,
      price: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('GoodsReceipt', GoodsReceiptSchema);
