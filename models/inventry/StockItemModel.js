const mongoose = require('mongoose');
const { Schema } = mongoose;

const StockItemSchema = new Schema({
  materialId: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialCategory', required: true },
  description: String,
  baseUnit: String,
  orderUnit: String,
  unit: String,  
  materialgroup: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: { type: String },
  buyerGroup: String,
  location: { type: String, required: true },
  quantityAvailable: { type: Number, default: 0 },
  lotNumber: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockItem', StockItemSchema);
