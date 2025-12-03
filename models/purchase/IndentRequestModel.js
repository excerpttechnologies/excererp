const mongoose = require('mongoose');

const IndentItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  baseUnit: String,
  orderUnit: String,
  qty: Number,
  deliveryDate: String,

  materialgroup: String,
});

const IndentRequestSchema = new mongoose.Schema({
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
  buyerGroup: { type: String, required: true },
  documentDate: { type: Date, default: Date.now },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
   financialYear:String,
  items: [IndentItemSchema],
  isDeleted: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('IndentRequest', IndentRequestSchema);

