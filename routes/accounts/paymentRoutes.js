const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByRecord,
  updatePayment,
  deletePayment,
  getPaymentSummary
} = require('../../controllers/accounts/paymentController');


router.get('/payment', getAllPayments);
router.post('/payment', createPayment);
router.get('/payment/:id', getPaymentById);
router.get('/payment/record/:recordId', getPaymentsByRecord);
router.put('/payment/:id', updatePayment);
router.delete('/payment/:id', deletePayment);
router.get('/payment-summary', getPaymentSummary);
module.exports = router;