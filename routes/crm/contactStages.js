const express = require('express');
const router = express.Router();
const contactStageController = require('../../controllers/crm/contactStageController');

// GET /api/crm/contact-stages - Get all contact stages
router.get('/', contactStageController.getContactStages);

// POST /api/crm/contact-stages - Create new contact stage
router.post('/', contactStageController.createContactStage);

// GET /api/crm/contact-stages/:id - Get contact stage by ID
router.get('/:id', contactStageController.getContactStageById);

// PUT /api/crm/contact-stages/:id - Update contact stage
router.put('/:id', contactStageController.updateContactStage);

// PUT /api/crm/contact-stages/:id/move - Move contact stage (reorder)
router.put('/:id/move', contactStageController.moveContactStage);

// DELETE /api/crm/contact-stages/:id - Delete contact stage
router.delete('/:id', contactStageController.deleteContactStage);

module.exports = router;