const express = require('express');
const router = express.Router();
const taxController = require('../../controllers/masterdata/Tax');

router.post('/', taxController.createTax);
router.get('/', taxController.getTaxes);
router.put('/:id', taxController.updateTax);


module.exports = router;
