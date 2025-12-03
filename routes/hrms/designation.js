const express = require('express');
const router = express.Router();
const designationController = require('../../controllers/hrms/designation');

router.post('/', designationController.createDesignation);
router.get('/', designationController.getAllDesignations);
router.put('/:id', designationController.updateDesignation);
router.delete('/:id', designationController.deleteDesignation);

module.exports = router;
