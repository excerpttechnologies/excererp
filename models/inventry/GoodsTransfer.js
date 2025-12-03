const mongoose = require('mongoose');

const GoodsTransferSchema = new mongoose.Schema({
  category: { type: String, required: true },
  catdesc: { type: String },
  docnumber: { type: String, unique: true, required: true },
  docDate: { type: String, required: true },
  postDate: { type: String, required: true },
  reference: { type: String },
  location: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: { type: String },
  items: [
    {
      materialId: { type: String },
      description: { type: String },
      quantity: { type: Number },
      baseUnit: { type: String },
      deliveryDate: { type: String },
      lotNo: { type: String },
      price: { type: Number },
      text: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('GoodsTransfer', GoodsTransferSchema);
