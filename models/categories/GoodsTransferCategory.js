const mongoose = require('mongoose');

const GoodsTransferCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true
  },
  // prefix: {
  //   type: String,
  //   required: true
  // },
  rangeStart: {
    type: Number,
    required: true
  },
  rangeEnd: {
    type: Number,
    required: true
  },
   companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    financialYear: String,
});

module.exports = mongoose.model('GoodsTransferCategory', GoodsTransferCategorySchema);
