const mongoose = require('mongoose');

const vendorCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true
  },
  // prefix: {
  //   type: String,
  //   required: true
  // },
  rangeFrom: {
    type: Number,
    required: true
  },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  rangeTo: {
    type: Number,
    required: true,
     

  }
});

module.exports = mongoose.model('VendorCategory', vendorCategorySchema);
