const GeneralCondition = require('../../models/masterdata/generalcondition');

exports.createGeneralCondition = async (req, res) => {
  try {
    const condition = new GeneralCondition(req.body);
    await condition.save();
    res.json(condition);
  } catch (err) {
    res.status(500).json({ message: 'Creation failed', error: err.message });
  }
};

exports.getAllGeneralConditions = async (req, res) => {
  try {
    const conditions = await GeneralCondition.find().sort({ createdAt: -1 });
    res.json(conditions);
  } catch (err) {
    res.status(500).json({ message: 'Fetching failed', error: err.message });
  }
};

exports.updateGeneralCondition = async (req, res) => {
  try {
    const updated = await GeneralCondition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

exports.deleteGeneralCondition = async (req, res) => {
  try {
    await GeneralCondition.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
