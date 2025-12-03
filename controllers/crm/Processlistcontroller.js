const Process = require('../../models/masterdata/Processlist');

exports.createProcess = async (req, res) => {
  try {
    const process = new Process(req.body);
    await process.save();
    res.json(process);
  } catch (err) {
    res.status(500).json({ message: 'Creation failed', error: err.message });
  }
};

exports.getAllProcesses = async (req, res) => {
  try {
    const processes = await Process.find().sort({ createdAt: -1 });
    res.json(processes);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

exports.updateProcess = async (req, res) => {
  try {
    const updated = await Process.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

exports.deleteProcess = async (req, res) => {
  try {
    await Process.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
