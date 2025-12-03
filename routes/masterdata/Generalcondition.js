const express = require('express');
const router = express.Router();
const controller = require('../../controllers/masterdata/generalcondition');

router.post('/', controller.createGeneralCondition);
router.get('/', controller.getAllGeneralConditions);
router.put('/:id', controller.updateGeneralCondition);
router.delete('/:id', controller.deleteGeneralCondition);

module.exports = router;
