const ContactStage = require('../../models/crm/ContactStage');

const contactStageController = {
  // Get all contact stages
  getContactStages: async (req, res) => {
    try {
      const { companyId } = req.query;
      const contactStages = await ContactStage.find({ companyId }).sort({ order: 1 });
      res.json(contactStages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new contact stage
  createContactStage: async (req, res) => {
    try {
      const contactStage = new ContactStage(req.body);
      await contactStage.save();
      res.status(201).json(contactStage);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get contact stage by ID
  getContactStageById: async (req, res) => {
    try {
      const contactStage = await ContactStage.findById(req.params.id);
      if (!contactStage) {
        return res.status(404).json({ error: 'Contact stage not found' });
      }
      res.json(contactStage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update contact stage
  updateContactStage: async (req, res) => {
    try {
      const contactStage = await ContactStage.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!contactStage) {
        return res.status(404).json({ error: 'Contact stage not found' });
      }
      res.json(contactStage);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete contact stage
  deleteContactStage: async (req, res) => {
    try {
      const contactStage = await ContactStage.findByIdAndDelete(req.params.id);
      if (!contactStage) {
        return res.status(404).json({ error: 'Contact stage not found' });
      }
      res.json({ message: 'Contact stage deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Move contact stage (reorder)
  moveContactStage: async (req, res) => {
    try {
      const { direction } = req.body;
      const currentStage = await ContactStage.findById(req.params.id);
      
      if (!currentStage) {
        return res.status(404).json({ error: 'Contact stage not found' });
      }

      const { companyId,  order: currentOrder } = currentStage;
      
      if (direction === 'up' && currentOrder > 1) {
        // Find the stage with order = currentOrder - 1
        const prevStage = await ContactStage.findOne({
          companyId,
          
          order: currentOrder - 1
        });
        
        if (prevStage) {
          // Swap orders
          await ContactStage.findByIdAndUpdate(currentStage._id, { order: currentOrder - 1 });
          await ContactStage.findByIdAndUpdate(prevStage._id, { order: currentOrder });
        }
      } else if (direction === 'down') {
        // Find the stage with order = currentOrder + 1
        const nextStage = await ContactStage.findOne({
          companyId,
          
          order: currentOrder + 1
        });
        
        if (nextStage) {
          // Swap orders
          await ContactStage.findByIdAndUpdate(currentStage._id, { order: currentOrder + 1 });
          await ContactStage.findByIdAndUpdate(nextStage._id, { order: currentOrder });
        }
      }

      res.json({ message: 'Contact stage moved successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = contactStageController;