// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  pincode: String,
  country: String,
  phone: String,
  email: String,
   logo: String
});

module.exports = mongoose.model('Company', companySchema);
