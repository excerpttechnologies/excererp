const mongoose = require('mongoose');

const ContractItemSchema = new mongoose.Schema({
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

const ContractSchema = new mongoose.Schema({
  contractNumber: { type: String, unique: true },
  indentId: String,
  categoryId: String,
  contractCategoryId: String,
  vendor: String,
  vendorName: String,
  contractReference: String, // New field for contract reference
  cnNo: String,
  validityFDate: Date,
  validityTDate: Date,
  
companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
   financialYear:String,
  note: String,
  location: String,
  buyerGroup: String,
  totalPrice: { type: Number, default: 0 }, // New field for total price
  items: [ContractItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Contract', ContractSchema);
