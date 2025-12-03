const express = require('express');
const router = express.Router();
const poCategoryController = require('../../controllers/categories/poCategoryController');

router.get('/', poCategoryController.getAllCategories);
router.post('/', poCategoryController.createCategory);
router.put('/:id', poCategoryController.updateCategory);

module.exports = router;
