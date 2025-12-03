const express = require('express');
const router = express.Router();
const leaveController = require('../../controllers/hrms/Leave');

// Create leave
router.post('/', leaveController.createLeave);

// Get leaves by employeeId
router.get('/', leaveController.getLeavesByEmployee);

// Update leave status
router.put('/:id', leaveController.updateLeaveStatus);

// Get all leaves (optional branch filter)
router.get('/all', leaveController.getAllLeaves);

module.exports = router;
