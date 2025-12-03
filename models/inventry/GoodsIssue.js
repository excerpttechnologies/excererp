const mongoose = require('mongoose');

const GoodsIssueSchema = new mongoose.Schema({
  category: { type: String, required: true },
  catdesc: { type: String },
  docnumber: { type: String, unique: true, required: true },
  documentDate: { type: String, required: true },
  postingDate: { type: String, required: true },
  reference: { type: String },
  customer: { type: String },
  location: { type: String },
  issueDate: { type: String },
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
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
      price: Number,
        availableQty: {
            type: Number,
            default: 0 // Default value for available quantity
        }
    }
  ],
  isdelete: {
    type: Boolean,
    default: false // Default value for isdelete
  }

}, { timestamps: true });

module.exports = mongoose.model('GoodsIssue', GoodsIssueSchema);
