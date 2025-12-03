const express = require("express");
const router = express.Router();
const salaryController = require("../../controllers/hrms/salary");

// Calculate leave count for salary
router.get("/leave-count", salaryController.getLeaveCount);

// Save salary record
router.post("/save", salaryController.saveSalaryRecord);

// Get all salary records
router.get("/", salaryController.getAllSalaryRecords);

// Get salary history for a specific employee
router.get("/employee/:employeeId", salaryController.getEmployeeSalaryHistory);

module.exports = router;
