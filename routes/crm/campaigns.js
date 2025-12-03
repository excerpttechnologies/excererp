const express = require('express');
const router = express.Router();
const campaignController = require('../../controllers/crm/campaignController');

// GET /api/campaigns - Get all campaigns
router.get('/', campaignController.getCampaigns);

// POST /api/campaigns - Create new campaign
router.post('/', campaignController.createCampaign);

// GET /api/campaigns/:id - Get campaign by ID
router.get('/:id', campaignController.getCampaignById);

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', campaignController.updateCampaign);

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;