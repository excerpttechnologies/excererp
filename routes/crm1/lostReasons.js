const express = require('express');
const router = express.Router();
const lostReasonController = require('../../controllers/crm/lostReasonController');

// GET /api/crm/lost-reasons - Get all lost reasons
router.get('/', lostReasonController.getLostReasons);

// POST /api/crm/lost-reasons - Create new lost reason
router.post('/', lostReasonController.createLostReason);

// GET /api/crm/lost-reasons/:id - Get lost reason by ID
router.get('/:id', lostReasonController.getLostReasonById);

// PUT /api/crm/lost-reasons/:id - Update lost reason
router.put('/:id', lostReasonController.updateLostReason);

// DELETE /api/crm/lost-reasons/:id - Delete lost reason
router.delete('/:id', lostReasonController.deleteLostReason);

module.exports = router;