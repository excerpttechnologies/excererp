const Call = require('../../models/crm/Call');

const callController = {
  // Get all calls
  getCalls: async (req, res) => {
    try {
      const { companyId } = req.query;
      const calls = await Call.find({ companyId }).sort({ createdAt: -1 });
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new call
  createCall: async (req, res) => {
    try {
      const call = new Call(req.body);
      await call.save();
      res.status(201).json(call);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get call by ID
  getCallById: async (req, res) => {
    try {
      const call = await Call.findById(req.params.id);
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      res.json(call);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update call
  updateCall: async (req, res) => {
    try {
      const call = await Call.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      res.json(call);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete call
  deleteCall: async (req, res) => {
    try {
      const call = await Call.findByIdAndDelete(req.params.id);
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      res.json({ message: 'Call deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = callController;