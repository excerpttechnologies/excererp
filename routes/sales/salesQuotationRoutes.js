const express = require('express');
const router = express.Router();
const controller = require('../../controllers/sales/salesQuotationController');

router.post('/', controller.createQuotation);
router.get('/', controller.getAllQuotations);

module.exports = router;
