const Campaign = require('../../models/crm/Campaign');

const campaignController = {
  // Get all campaigns
  getCampaigns: async (req, res) => {
    try {
      const { companyId } = req.query;
      const campaigns = await Campaign.find({ companyId}).sort({ createdAt: -1 });
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new campaign
  createCampaign: async (req, res) => {
    try {
      const campaign = new Campaign(req.body);
      await campaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get campaign by ID
  getCampaignById: async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update campaign
  updateCampaign: async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete campaign
  deleteCampaign: async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndDelete(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = campaignController;