const express = require('express');
const router = express.Router();

const {
  createInvoiceCategory,
  getAllInvoiceCategories,
  updateInvoiceCategory,
  deleteInvoiceCategory,
  generateInvoiceNumber,
  getCurrentYearCategories
} = require('../../controllers/categories/invoiceCategoryController');

// POST new category
router.post('/', createInvoiceCategory);

// GET all categories
router.get('/', getAllInvoiceCategories);

// PUT update category
router.put('/:id', updateInvoiceCategory);
// Add these routes to your invoice category routes file
router.delete('/:id', deleteInvoiceCategory);
router.post('/:id/generate-number', generateInvoiceNumber);
router.get('/current-year', getCurrentYearCategories);
module.exports = router;
