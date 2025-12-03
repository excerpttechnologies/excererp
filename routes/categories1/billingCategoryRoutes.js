const express = require('express');
const router = express.Router();

const {
  createBillingCategory,
  getAllBillingCategories,
  updateBillingCategory
} = require('../../controllers/categories/billingCategoryController');

router.post('/', createBillingCategory);
router.get('/', getAllBillingCategories);
router.put('/:id', updateBillingCategory);

module.exports = router;
