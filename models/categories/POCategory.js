const mongoose = require('mongoose');

const poCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  // prefix: { type: String, required: true },
  rangeFrom: { type: Number, required: true },
  rangeTo: { type: Number, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
},{ timestamps: true });


module.exports = mongoose.model('POCategory', poCategorySchema);
