
const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  name: String,
  subPermissions: [String]
});
module.exports = mongoose.model("Permission", PermissionSchema);


const RoleSchema = new mongoose.Schema({
  roleId: String,
  roleName: String,
  // We'll keep the original flat permissions array for backward compatibility
  permissions: [String],
  // Add a new structured permissions field
  structuredPermissions: [PermissionSchema]
});

module.exports = mongoose.model("Role", RoleSchema);

