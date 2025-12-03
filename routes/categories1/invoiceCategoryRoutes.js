const express = require('express');
const router = express.Router();

const {
  createInvoiceCategory,
  getAllInvoiceCategories,
  updateInvoiceCategory
} = require('../../controllers/categories/invoiceCategoryController');

// POST new category
router.post('/', createInvoiceCategory);

// GET all categories
router.get('/', getAllInvoiceCategories);

// PUT update category
router.put('/:id', updateInvoiceCategory);

module.exports = router;
