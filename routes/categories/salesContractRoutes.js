const express = require('express');
const router = express.Router();
const contractController = require('../../controllers/sales/salesContractController');

// POST /api/salescontracts - Create new contract
router.post('/', contractController.createContract);

// GET /api/salescontracts - Get all contracts
router.get('/', contractController.getAllContracts);

// GET /api/salescontracts/stats - Get contract statistics
router.get('/stats', contractController.getContractStats);

// GET /api/salescontracts/date-range - Get contracts by date range
router.get('/date-range', contractController.getContractsByDateRange);

// GET /api/salescontracts/customer/:customerId - Get contracts by customer
router.get('/customer/:customerId', contractController.getContractsByCustomer);

// GET /api/salescontracts/:id - Get contract by ID
router.get('/:id', contractController.getContractById);

// PUT /api/salescontracts/:id - Update contract
router.put('/:id', contractController.updateContract);

// DELETE /api/salescontracts/:id - Delete contract
router.delete('/:id', contractController.deleteContract);

module.exports = router;