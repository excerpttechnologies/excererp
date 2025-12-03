const express = require('express');
const router = express.Router();
const contractCategoryController = require('../../controllers/categories/PurchaseContractCategoryController');

// POST /api/purchase-contract-categories - Create new category
router.post('/', contractCategoryController.createCategory);

// GET /api/purchase-contract-categories - Get all categories
router.get('/', contractCategoryController.getAllCategories);

// GET /api/purchase-contract-categories/active - Get active categories only
router.get('/active', contractCategoryController.getActiveCategories);

// POST /api/purchase-contract-categories/check-range - Check range availability
router.post('/check-range', contractCategoryController.checkRangeAvailability);

// GET /api/purchase-contract-categories/prefix/:prefix - Get categories by prefix
router.get('/prefix/:prefix', contractCategoryController.getCategoriesByPrefix);

// GET /api/purchase-contract-categories/:id - Get category by ID
router.get('/:id', contractCategoryController.getCategoryById);

// PUT /api/purchase-contract-categories/:id - Update category
router.put('/:id', contractCategoryController.updateCategory);

// DELETE /api/purchase-contract-categories/:id - Delete category
router.delete('/:id', contractCategoryController.deleteCategory);

module.exports = router;