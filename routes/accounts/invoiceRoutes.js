const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  updateInvoice,
  getInvoiceById
} = require('../../controllers/accounts/invoiceController');

router.post('/invoiceform', createInvoice);
router.get('/invoiceform', getAllInvoices);
router.put('/invoiceform/:id',updateInvoice);
router.get('/invoiceform/:id',getInvoiceById);
module.exports = router;
