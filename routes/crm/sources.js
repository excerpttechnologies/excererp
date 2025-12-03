const express = require('express');
const router = express.Router();
const sourceController = require('../../controllers/crm/sourceController');

// GET /api/crm/sources - Get all sources
router.get('/', sourceController.getSources);

// POST /api/crm/sources - Create new source
router.post('/', sourceController.createSource);

// GET /api/crm/sources/:id - Get source by ID
router.get('/:id', sourceController.getSourceById);

// PUT /api/crm/sources/:id - Update source
router.put('/:id', sourceController.updateSource);

// DELETE /api/crm/sources/:id - Delete source
router.delete('/:id', sourceController.deleteSource);

module.exports = router;