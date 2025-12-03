const Role = require('../models/Roles');

const permissionController = {
  // Get permissions by role name
  getPermissionsByRole: async (req, res) => {
    try {
      const { roleName } = req.params;
      console.log('Fetching permissions for role:', roleName);
      if (!roleName) {
        return res.status(400).json({
          success: false,
          message: 'Role name is required'
        });
      }

      // Find the role by roleName and populate structured permissions
      const role = await Role.findOne({ roleName: roleName });
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
          data: []
        });
      }

      // Return structured permissions
      return res.status(200).json({
        success: true,
        message: 'Permissions fetched successfully',
        data: role.structuredPermissions || []
      });

    } catch (error) {
      console.error('Error fetching permissions:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Get all roles (optional - for dropdown/selection purposes)
  getAllRoles: async (req, res) => {
    try {
      const roles = await Role.find({}, 'roleId roleName');
      
      return res.status(200).json({
        success: true,
        message: 'Roles fetched successfully',
        data: roles
      });

    } catch (error) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

module.exports = permissionController;
