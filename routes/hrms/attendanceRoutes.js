// // const express = require('express');
// // const router = express.Router();
// // const attendanceController = require('../../controllers/hrms/attendanceController');
// // router.get('/', attendanceController.getAttendanceRecords);

// // router.get('/today', attendanceController.getTodayAttendance);
// // // Mark manual attendance
// // router.post('/', attendanceController.markAttendance);

// // // Auto attendance (IN/OUT toggle)
// // router.post('/auto', attendanceController.autoAttendance);

// // // Get attendance records with optional filters (date, employeeId)

// // // Get today's attendance


// // // Get database statistics
// // router.get('/stats', attendanceController.getStats);

// // module.exports = router;



// //ROUTES

// const express = require('express');
// const router = express.Router();
// const attendanceController = require('../../controllers/hrms/attendanceController');

// // IMPORTANT: Specific routes MUST come before parameterized routes

// // Get today's attendance (specific route)
// router.get('/today', attendanceController.getTodayAttendance);
// router.get('/records', attendanceController.getAllEmployeeRecords);
// // Get database statistics (specific route)
// router.get('/stats', attendanceController.getStats);

// // Get all employee records (specific route)


// // Get attendance by specific date (parameterized route)
// router.get('/date/:date', attendanceController.getAttendanceByDate);

// // Get attendance records with optional filters (general route)
// router.get('/', attendanceController.getAttendanceRecords);

// // Mark manual attendance
// router.post('/', attendanceController.markAttendance);

// // Auto attendance (IN/OUT toggle)
// router.post('/auto', attendanceController.autoAttendance);
// router.put('/update/:date',attendanceController.updaterecord);
// router.delete('/delete/:date/:employeeObjectId',attendanceController.deletebyid);
// router.delete('/bulk-delete',attendanceController.deleteall)

// module.exports = router;

const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/hrms/attendanceController');

// IMPORTANT: Specific routes MUST come before parameterized routes

// Get today's attendance (specific route)
router.get('/today', attendanceController.getTodayAttendance);

// Get all employee records (specific route)
router.get('/records', attendanceController.getAllEmployeeRecords);

// Get database statistics (specific route)
router.get('/stats', attendanceController.getStats);

// Get attendance by specific date (parameterized route)
router.get('/date/:date', attendanceController.getAttendanceByDate);

// Get attendance records with optional filters (general route)
router.get('/', attendanceController.getAttendanceRecords);

// Mark manual attendance (auto-syncs to Google Sheets)
router.post('/', attendanceController.markAttendance);

// Auto attendance (IN/OUT toggle) (auto-syncs to Google Sheets)
router.post('/auto', attendanceController.autoAttendance);

// 🆕 ONE-TIME: Sync existing MongoDB data to Google Sheets
router.post('/sync-to-sheets', attendanceController.syncToGoogleSheets);

// Update attendance record (auto-syncs to Google Sheets)
router.put('/update/:date', attendanceController.updaterecord);

// Delete attendance record (auto-syncs to Google Sheets)
router.delete('/delete/:date/:employeeObjectId', attendanceController.deletebyid);

// Bulk delete attendance records (auto-syncs to Google Sheets)
router.post('/bulk-delete', attendanceController.deleteall);

module.exports = router;