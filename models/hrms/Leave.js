const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeName: String,
  employeeId: String,
  name: String,
  leaveType: String,
  fromDate: Date,
  toDate: Date,
  reason: String,
  status: { type: String, default: "Pending" },
  requestedDate: { type: Date, default: Date.now },
  branchId: String, // include this if filtering by branchId
}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
