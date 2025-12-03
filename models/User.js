const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  phone: String,
  address: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]

});
module.exports = mongoose.model('User', userSchema);
