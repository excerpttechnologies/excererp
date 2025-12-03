const express = require('express');
const router = express.Router();
const controller = require('../../controllers/crm/Processlistcontroller');

router.post('/', controller.createProcess);
router.get('/', controller.getAllProcesses);
router.put('/:id', controller.updateProcess);
router.delete('/:id', controller.deleteProcess);

module.exports = router;
