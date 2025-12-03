// const express = require('express');
// const router = express.Router();
// const purchaseOrderController = require('../../controllers/purchase/purchaseOrderController');

// router.post('/', purchaseOrderController.createPO);
// router.get('/', purchaseOrderController.getAllPOs);
// router.get('/:id', purchaseOrderController.getPOById);

// module.exports = router;


const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../../controllers/purchase/purchaseOrderController');

// Create Purchase Order
router.post('/', purchaseOrderController.createPO);

// Get All Purchase Orders
router.get('/', purchaseOrderController.getAllPOs);

// Get Purchase Order by ID
router.get('/:id', purchaseOrderController.getPOById);

// Update Purchase Order
router.put('/:id', purchaseOrderController.updatePO);

// Approve Purchase Order
router.put('/:id/approve', purchaseOrderController.approvePO);

// Reject Purchase Order
router.put('/:id/reject', purchaseOrderController.rejectPO);

// Delete Purchase Order
router.delete('/:id', purchaseOrderController.deletePO);

// Get Purchase Orders by Status
router.get('/status/:status', purchaseOrderController.getPOsByStatus);

// Search Purchase Orders
router.get('/search', purchaseOrderController.searchPOs);

// Get Purchase Order Statistics
router.get('/stats', purchaseOrderController.getPOStats);

module.exports = router;