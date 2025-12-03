const express = require('express');
const router = express.Router();
const callController = require('../../controllers/crm/callController');

// GET /api/crm/calls - Get all calls
router.get('/', callController.getCalls);

// POST /api/crm/calls - Create new call
router.post('/', callController.createCall);

// GET /api/crm/calls/:id - Get call by ID
router.get('/:id', callController.getCallById);

// PUT /api/crm/calls/:id - Update call
router.put('/:id', callController.updateCall);

// DELETE /api/crm/calls/:id - Delete call
router.delete('/:id', callController.deleteCall);

module.exports = router;