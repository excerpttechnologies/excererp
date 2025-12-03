const LostReason = require('../../models/crm/LostReason');

const lostReasonController = {
  // Get all lost reasons
  getLostReasons: async (req, res) => {
    try {
      const { companyId } = req.query;
      const lostReasons = await LostReason.find({ companyId}).sort({ createdAt: -1 });
      res.json(lostReasons);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new lost reason
  createLostReason: async (req, res) => {
    try {
      const lostReason = new LostReason(req.body);
      await lostReason.save();
      res.status(201).json(lostReason);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get lost reason by ID
  getLostReasonById: async (req, res) => {
    try {
      const lostReason = await LostReason.findById(req.params.id);
      if (!lostReason) {
        return res.status(404).json({ error: 'Lost reason not found' });
      }
      res.json(lostReason);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update lost reason
  updateLostReason: async (req, res) => {
    try {
      const lostReason = await LostReason.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!lostReason) {
        return res.status(404).json({ error: 'Lost reason not found' });
      }
      res.json(lostReason);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete lost reason
  deleteLostReason: async (req, res) => {
    try {
      const lostReason = await LostReason.findByIdAndDelete(req.params.id);
      if (!lostReason) {
        return res.status(404).json({ error: 'Lost reason not found' });
      }
      res.json({ message: 'Lost reason deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = lostReasonController;