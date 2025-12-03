const Lead = require('../../models/crm/Lead');
const Campaign = require('../../models/crm/Campaign');

const leadController = {
  // Get all leads
  getLeads: async (req, res) => {
    try {
      const { companyId } = req.query;
      const leads = await Lead.find({ companyId})
        .populate('campaignId', 'campaignName')
        .sort({ createdAt: -1 });
      
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new lead
  createLead: async (req, res) => {
    try {
      const lead = new Lead(req.body);
      await lead.save();
      await lead.populate('campaignId', 'campaignName');
      
      // Update campaign leads count if associated with a campaign
      if (lead.campaignId) {
        await Campaign.findByIdAndUpdate(
          lead.campaignId,
          { $inc: { leads: 1 } }
        );
      }
      
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get lead by ID
  getLeadById: async (req, res) => {
    try {
      const lead = await Lead.findById(req.params.id).populate('campaignId', 'campaignName');
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update lead
  updateLead: async (req, res) => {
    try {
      const oldLead = await Lead.findById(req.params.id);
      const oldCampaignId = oldLead?.campaignId;
      const oldStatus = oldLead?.leadStatus;
      
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('campaignId', 'campaignName');
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Update campaign counts if campaign changed
      if (oldCampaignId && oldCampaignId.toString() !== req.body.campaignId) {
        // Decrease count from old campaign
        await Campaign.findByIdAndUpdate(oldCampaignId, { $inc: { leads: -1 } });
      }
      
      if (req.body.campaignId && req.body.campaignId !== oldCampaignId?.toString()) {
        // Increase count for new campaign
        await Campaign.findByIdAndUpdate(req.body.campaignId, { $inc: { leads: 1 } });
      }

      // Update conversion count if status changed to "Closed Won"
      if (oldStatus !== 'Closed Won' && req.body.leadStatus === 'Closed Won' && lead.campaignId) {
        await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: 1 } });
      } else if (oldStatus === 'Closed Won' && req.body.leadStatus !== 'Closed Won' && lead.campaignId) {
        await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: -1 } });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete lead
  deleteLead: async (req, res) => {
    try {
      const lead = await Lead.findByIdAndDelete(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      // Decrease campaign leads count if associated with a campaign
      if (lead.campaignId) {
        await Campaign.findByIdAndUpdate(
          lead.campaignId,
          { $inc: { leads: -1 } }
        );
        
        // Decrease conversions count if lead was converted
        if (lead.leadStatus === 'Closed Won') {
          await Campaign.findByIdAndUpdate(
            lead.campaignId,
            { $inc: { conversions: -1 } }
          );
        }
      }
      
      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get leads by campaign
  getLeadsByCampaign: async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { companyId } = req.query;
      
      const leads = await Lead.find({ 
        campaignId, 
        companyId, 
      }).populate('campaignId', 'campaignName');
      
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = leadController;