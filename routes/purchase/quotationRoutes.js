// routes/quotationRoutes.js
const express = require('express');
const router = express.Router();
const quotationController = require('../../controllers/purchase/quotationController');

router.post('/create', quotationController.createQuotation);
router.get('/get', quotationController.getAllQuotations);
router.get('/:id', quotationController.getQuotationById);
router.put('/:id', quotationController.updateQuotationById);

module.exports = router;
