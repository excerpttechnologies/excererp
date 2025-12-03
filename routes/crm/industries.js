const express = require('express');
const router = express.Router();
const industryController = require('../../controllers/crm/industryController');

// GET /api/crm/industries - Get all industries
router.get('/', industryController.getIndustries);

// POST /api/crm/industries - Create new industry
router.post('/', industryController.createIndustry);

// GET /api/crm/industries/:id - Get industry by ID
router.get('/:id', industryController.getIndustryById);

// PUT /api/crm/industries/:id - Update industry
router.put('/:id', industryController.updateIndustry);

// DELETE /api/crm/industries/:id - Delete industry
router.delete('/:id', industryController.deleteIndustry);

module.exports = router;