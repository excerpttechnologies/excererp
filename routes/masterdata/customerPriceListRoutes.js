const express = require('express');
const router = express.Router();
const controller = require('../../controllers/masterdata/customerPriceListController');

router.post('/', controller.createCustomerPrice);
router.get('/', controller.getCustomerPrices);
router.get('/:id', controller.getCustomerPriceById);
router.put('/:id', controller.updateCustomerPrice);

module.exports = router;