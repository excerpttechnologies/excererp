const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/masterdata/customerController');

router.post('/', customerController.createCustomer);
router.get('/', customerController.getCustomers);
router.put('/:id', customerController.updateCustomer);
router.put('/status/:id', customerController.updateCustomerStatus);

module.exports = router;
