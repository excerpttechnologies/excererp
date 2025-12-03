const express = require('express');
const router = express.Router();
const customerCategoryController = require('../../controllers/categories/customerCategoryController');

router.post('/', customerCategoryController.createCustomerCategory);
router.get('/', customerCategoryController.getAllCustomerCategories);
router.get('/:id', customerCategoryController.getCustomerCategoryById);
router.put('/:id', customerCategoryController.updateCustomerCategory);
router.delete('/:id', customerCategoryController.deleteCustomerCategory);

module.exports = router;
