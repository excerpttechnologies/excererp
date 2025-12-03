const mongoose = require('mongoose');

const SalesItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  baseUnit: String,
  orderUnit: String,
  qty: Number,
  deliveryDate: String,
  location: String,
  salesGroup: String,
  materialgroup: String,
})
const SaleRequestSchema = new mongoose.Schema({
  indentId: String,
  categoryId: String,
  categoryName: String,
  indentIdType: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal',
  },
  indentId: String,
  location: { type: String, required: true },
  salesGroup: { type: String, required: true },
  documentDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  items: [SalesItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('SalesRequest', SaleRequestSchema);

