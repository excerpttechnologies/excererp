const Source = require('../../models/crm/Source');

const sourceController = {
  // Get all sources
  getSources: async (req, res) => {
    try {
      const { companyId } = req.query;
      const sources = await Source.find({ companyId}).sort({ createdAt: -1 });
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new source
  createSource: async (req, res) => {
    try {
      const source = new Source(req.body);
      await source.save();
      res.status(201).json(source);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get source by ID
  getSourceById: async (req, res) => {
    try {
      const source = await Source.findById(req.params.id);
      if (!source) {
        return res.status(404).json({ error: 'Source not found' });
      }
      res.json(source);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update source
  updateSource: async (req, res) => {
    try {
      const source = await Source.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!source) {
        return res.status(404).json({ error: 'Source not found' });
      }
      res.json(source);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete source
  deleteSource: async (req, res) => {
    try {
      const source = await Source.findByIdAndDelete(req.params.id);
      if (!source) {
        return res.status(404).json({ error: 'Source not found' });
      }
      res.json({ message: 'Source deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = sourceController;