const Designation = require('../../models/hrms/designation');


// POST: Create new designation
exports.createDesignation = async (req, res) => {
  try {
    const { designName, departmentId } = req.body;

    const newDesignation = new Designation({ designName, departmentId });
    const saved = await newDesignation.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating designation:', err);
    res.status(500).json({ error: 'Server error while creating designation' });
  }
};

// GET: Get all designations with department info
exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.find().populate('departmentId', 'departmentName');
    res.json(designations);
  } catch (err) {
    console.error('Error fetching designations:', err);
    res.status(500).json({ error: 'Server error while fetching designations' });
  }
};

// PUT: Update designation by ID
exports.updateDesignation = async (req, res) => {
  try {
    const { designName, departmentId } = req.body;
    const updated = await Designation.findByIdAndUpdate(
      req.params.id,
      { designName, departmentId },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Designation not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating designation:', err);
    res.status(500).json({ error: 'Server error while updating designation' });
  }
};

// DELETE: Delete designation by ID
exports.deleteDesignation = async (req, res) => {
  try {
    const deleted = await Designation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Designation not found' });
    }
    res.json({ message: '✅ Designation deleted successfully' });
  } catch (err) {
    console.error('Error deleting designation:', err);
    res.status(500).json({ error: 'Server error while deleting designation' });
  }
};
