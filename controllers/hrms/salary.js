const SalaryRecord = require("../../models/hrms/salary");
const Leave = require("../../models/hrms/Leave");

// GET: Leave count for employee for a given month/year
exports.getLeaveCount = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    console.log("empquesries", req.query)
    if (!employeeId || !month || !year) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = new Date(`${endYear}-${endMonth < 10 ? '0' + endMonth : endMonth}-01`);

    const leaves = await Leave.find({
      employeeId,
      status: "Approved",
      $or: [
        { fromDate: { $gte: startDate, $lt: endDate } },
        { toDate: { $gte: startDate, $lt: endDate } },
        { fromDate: { $lt: startDate }, toDate: { $gte: endDate } }
      ]
    });

    let leaveCount = 0;
    let sundayCount = 0;

    for (const leave of leaves) {
      const effectiveStart = new Date(Math.max(leave.fromDate.getTime(), startDate.getTime()));
      const effectiveEnd = new Date(Math.min(leave.toDate.getTime(), endDate.getTime() - 1));

      let currentDate = new Date(effectiveStart);
      while (currentDate <= effectiveEnd) {
        currentDate.getDay() === 0 ? sundayCount++ : leaveCount++;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return res.status(200).json({
      leaveCount,
      sundayCount,
      totalDays: leaveCount + sundayCount,
    });
  } catch (error) {
    console.error("Error fetching leave count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST: Save salary record
exports.saveSalaryRecord = async (req, res) => {
  try {
    const {
      facultyId,
      employeeId,
      salary,
      month,
      year,
      leaveCount,
      sundayCount,
      totalLeaveCount,
      deductionPerDay,
      totalDeduction,
      payableSalary,
      date
    } = req.body;

    const existing = await SalaryRecord.findOne({ facultyId, month, year });
    if (existing) {
      return res.status(400).json({
        error: "Salary already recorded for this employee in the same month",
      });
    }

    const record = new SalaryRecord({
      facultyId,
      employeeId,
      salary,
      month,
      year,
      leaveCount,
      sundayCount,
      totalLeaveCount,
      deductionPerDay,
      totalDeduction,
      payableSalary,
      date: new Date(date),
    });

    await record.save();

    res.status(201).json({
      message: "Salary record saved successfully",
      salaryRecord: record,
    });
  } catch (error) {
    console.error("Error saving salary record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET: All salary records
exports.getAllSalaryRecords = async (req, res) => {
  try {
    const records = await SalaryRecord.find({})
      .populate("facultyId", "firstName lastName employeeId department")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching salary records:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET: Salary records for specific employee
exports.getEmployeeSalaryHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const records = await SalaryRecord.find({ employeeId })
      .populate("facultyId", "firstName lastName employeeId department")
      .sort({ year: -1, month: -1 });

    res.json(records);
  } catch (error) {
    console.error("Error fetching employee salary history:", error);
    res.status(500).json({ message: "Server error" });
  }
};
