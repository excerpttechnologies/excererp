const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorCategory',
    required: true
  },
  vnNo: {
    type: String,
    unique: true
  },
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
  contactname: String,
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

module.exports = mongoose.model('Vendor', vendorSchema);
