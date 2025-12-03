const Leave = require('../../models/hrms/Leave');

// Create a new leave request
exports.createLeave = async (req, res) => {
  try {
    const newLeave = new Leave(req.body);
    await newLeave.save();
    res.status(201).json({ message: "Leave request submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit leave request" });
  }
};

// Get leaves by employeeId
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const leaveRequests = await Leave.find({ employeeId });
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
};

// Update leave status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Leave.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Leave status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update leave status" });
  }
};

// Get all leaves (optionally by branchId)
exports.getAllLeaves = async (req, res) => {
  try {
    const { branchId } = req.query;
    let leaves = branchId
      ? await Leave.find({ branchId })
      : await Leave.find();

    res.json(leaves);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Failed to fetch leave requests" });
  }
};
