const Department = require('../../models/hrms/department');

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching departments' });
  }
};
const generateDepId = async () => {
  const lastDept = await Department.findOne().sort({ dep_id: -1 });
  if (!lastDept) return 'DEP001';

  const lastIdNum = parseInt(lastDept.dep_id.replace('DEP', ''));
  const newId = 'DEP' + String(lastIdNum + 1).padStart(3, '0');
  return newId;
};
// POST: Create a new department
exports.createDepartment = async (req, res) => {
  try {
    const { departmentName } = req.body;

    if (!departmentName) {
      return res.status(400).json({ error: 'Department name is required' });
    }
 const dep_id = await generateDepId();
   
    const newDepartment = new Department({dep_id, departmentName});
    const savedDepartment = await newDepartment.save();

    res.status(201).json(savedDepartment);
  } catch (err) {
    console.error('❌ Error creating department:', err);
    res.status(500).json({ error: 'Server error while creating department' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { departmentName } = req.body;
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      { departmentName },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating department:', err);
    res.status(500).json({ error: 'Server error while updating department' });
  }
};

// DELETE: Delete department by ID
exports.deleteDepartment = async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ message: '✅ Department deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting department:', err);
    res.status(500).json({ error: 'Server error while deleting department' });
  }
};