const express = require('express');
const router = express.Router();
const rfqCategoryController = require('../../controllers/categories/quotationCategoryController');

// Create RFQ category
router.post('/', rfqCategoryController.createCategory);

// Get all RFQ categories
router.get('/', rfqCategoryController.getAllCategories);
router.put('/:id', rfqCategoryController.updateCategory);

module.exports = router;
