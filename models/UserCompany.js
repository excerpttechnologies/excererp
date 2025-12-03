const mongoose = require('mongoose');
const userCompanySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  role: String
});
module.exports = mongoose.model('UserCompany', userCompanySchema);
