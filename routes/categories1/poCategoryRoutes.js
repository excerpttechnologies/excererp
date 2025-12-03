const express = require('express');
const router = express.Router();
const poCategoryController = require('../../controllers/categories/poCategoryController');

router.get('/', poCategoryController.getAllCategories, (req, res) => {
  console.log('Fetched all PO Categories');
});
router.post('/', poCategoryController.createCategory , (req, res) => {
  console.log('Created PO Category:', req.body);
});
router.put('/:id', poCategoryController.updateCategory);

module.exports = router;
  