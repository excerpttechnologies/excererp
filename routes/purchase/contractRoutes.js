const express = require('express');
const router = express.Router();
// const contractController = require('../controllers/contractController');
const contractController = require('../../controllers/purchase/contractController')
router.post('/create', contractController.createContract);
router.get('/get', contractController.getAllContracts);
router.get('/:id', contractController.getContractById);
router.put('/:id', contractController.updateContractById);

module.exports = router;
