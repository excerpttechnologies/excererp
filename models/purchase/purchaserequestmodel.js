const mongoose = require('mongoose');

const purchaseCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
  // prefix: { type: String, required: true },
  rangeStart: { type: Number, required: true },
  rangeEnd: { type: Number, required: true } 
}, { timestamps: true });

// Change model name here to 'MaterialCategory'
module.exports = mongoose.model('Purchasecategory', purchaseCategorySchema);

