const express = require('express');
const router = express.Router();

const {
  createGoodsReceiptCategory,
  getAllGoodsReceiptCategories,
  updateGoodsReceiptCategory
} = require('../../controllers/categories/goodsReceiptCategoryController');

// POST new category
router.post('/', createGoodsReceiptCategory);

// GET all categories
router.get('/', getAllGoodsReceiptCategories);

// PUT update category
router.put('/:id', updateGoodsReceiptCategory);

module.exports = router;
