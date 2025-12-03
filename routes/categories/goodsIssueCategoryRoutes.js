const express = require('express');
const router = express.Router();
const {
  createGoodsIssueCategory,
  getAllGoodsIssueCategories,
  updateGoodsIssueCategory
} = require('../../controllers/categories/goodsIssueCategoryController');

// POST new category
router.post('/', createGoodsIssueCategory);

// GET all categories
router.get('/', getAllGoodsIssueCategories);

// PUT update category
router.put('/:id', updateGoodsIssueCategory);

module.exports = router;
