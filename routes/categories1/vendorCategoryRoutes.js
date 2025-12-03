const express = require('express');
const router = express.Router();
const vendorCategoryController = require('../../controllers/categories/vendorCategoryController');

router.post('/', vendorCategoryController.createVendorCategory);
router.get('/', vendorCategoryController.getAllVendorCategories);
router.get('/:id', vendorCategoryController.getVendorCategoryById);
router.put('/:id', vendorCategoryController.updateVendorCategory);
router.delete('/:id', vendorCategoryController.deleteVendorCategory);

module.exports = router;
