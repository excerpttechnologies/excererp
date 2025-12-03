const express = require('express');
const router = express.Router();
const controller = require('../../controllers/categories/saleQuotationCategoryController');

router.post('/', controller.createCategory);
router.get('/', controller.getAllCategories);
router.put('/:id', controller.updateCategory);

module.exports = router;
