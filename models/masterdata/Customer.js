const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  cnNo: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCategory' },
  name1: String,
  name2: String,
  search: String,
  address1: String,
  address2: String,
  extraAddresses: [String],
  city: String,
  pincode: String,
  region: String,
  country: String,
  contactNo: String,
  name: String,
  email: String,
  gstin:String,
  isDeleted: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
   companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
   financialYear:String

}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
