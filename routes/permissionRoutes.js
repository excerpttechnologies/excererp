const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

// Route to get permissions by role name
router.get('/:roleName', permissionController.getPermissionsByRole);

// Route to get all roles (optional)
router.get('/roles', permissionController.getAllRoles);

module.exports = router;
