const express = require('express');
const router = express.Router();
const contractCategoryController = require('../../controllers/categories/saleContractCategoryController');

// POST /api/sale-contract-categories - Create new category
router.post('/', contractCategoryController.createCategory);

// GET /api/sale-contract-categories - Get all categories
router.get('/', contractCategoryController.getAllCategories);

// GET /api/sale-contract-categories/active - Get active categories only
router.get('/active', contractCategoryController.getActiveCategories);

// GET /api/sale-contract-categories/:id - Get category by ID
router.get('/:id', contractCategoryController.getCategoryById);

// PUT /api/sale-contract-categories/:id - Update category
router.put('/:id', contractCategoryController.updateCategory);

// DELETE /api/sale-contract-categories/:id - Delete category
router.delete('/:id', contractCategoryController.deleteCategory);

module.exports = router;