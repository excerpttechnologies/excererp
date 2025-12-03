const express = require('express');
const router = express.Router();
const salesDeliveryController = require('../../controllers/sales/salesdeliveryController');

// Generate delivery number
router.post('/generate-delivery-number', salesDeliveryController.generateDeliveryNumber);

// CRUD operations
router.post('/salesdeliveries', salesDeliveryController.createSalesDelivery);
router.get('/salesdeliveries', salesDeliveryController.getAllSalesDeliveries);
router.get('/salesdeliveries/:id', salesDeliveryController.getSalesDeliveryById);
// router.put('/salesdeliveries/:id', salesDeliveryController.updateSalesDelivery);
router.delete('/salesdeliveries/:id', salesDeliveryController.deleteSalesDelivery);

// Special operations
router.get('/salesdeliveries/by-order/:salesOrderId', salesDeliveryController.getDeliveriesBySalesOrder);
router.patch('/salesdeliveries/:id/status', salesDeliveryController.updateDeliveryStatus);
router.get('/delivery-statistics', salesDeliveryController.getDeliveryStatistics);

module.exports = router;