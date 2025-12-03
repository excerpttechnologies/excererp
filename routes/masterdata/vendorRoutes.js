const express = require('express');
const router = express.Router();
const vendorController = require('../../controllers/masterdata/vendorController');

router.post('/', vendorController.createVendor);
router.get('/', vendorController.getVendors);
router.get('/:id',vendorController.getVendorById)
router.put('/:id', vendorController.updateVendor);
router.put('/status/:id', vendorController.updateVendorStatus);

module.exports = router;
