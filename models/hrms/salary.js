const mongoose = require("mongoose");

const salaryRecordSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  employeeId: String,
  salary: Number,
  month: String,
  year: String,
  leaveCount: { type: Number, default: 0 },
  deductionPerDay: { type: Number, default: 0 },
  totalDeduction: { type: Number, default: 0 },
  payableSalary: Number,
  date: Date,
}, { timestamps: true });

module.exports = mongoose.model("SalaryRecord", salaryRecordSchema);
