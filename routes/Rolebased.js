const express = require('express');
const router = express.Router();
const roleController = require('../controllers/Rolebased');

router.get('/', roleController.getAllRoles);
router.get('/next-id', roleController.getNextRoleId);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);
router.get('/check-name', roleController.checkRoleName);

module.exports = router;
