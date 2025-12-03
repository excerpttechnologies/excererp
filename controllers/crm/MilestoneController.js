const Milestone = require('../../models/crm/Milestone');

const milestoneController = {
  // Get all milestones
  getMilestones: async (req, res) => {
    try {
      const { companyId} = req.query;
      const milestones = await Milestone.find({ companyId})
        .populate('projectId', 'projectName')
        .sort({ createdAt: -1 });
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new milestone
  createMilestone: async (req, res) => {
    try {
      const milestone = new Milestone(req.body);
      await milestone.save();
      await milestone.populate('projectId', 'projectName');
      res.status(201).json(milestone);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get milestone by ID
  getMilestoneById: async (req, res) => {
    try {
      const milestone = await Milestone.findById(req.params.id).populate('projectId', 'projectName');
      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update milestone
  updateMilestone: async (req, res) => {
    try {
      const milestone = await Milestone.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('projectId', 'projectName');
      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }
      res.json(milestone);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete milestone
  deleteMilestone: async (req, res) => {
    try {
      const milestone = await Milestone.findByIdAndDelete(req.params.id);
      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }
      res.json({ message: 'Milestone deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = milestoneController;