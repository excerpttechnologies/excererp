const express = require('express');
const router = express.Router();
const timeEntryController = require('../../controllers/crm/timeEntryController');

// GET /api/time-entries - Get all time entries
router.get('/', timeEntryController.getTimeEntries);

// POST /api/time-entries - Create new time entry
router.post('/', timeEntryController.createTimeEntry);

// GET /api/time-entries/:id - Get time entry by ID
router.get('/:id', timeEntryController.getTimeEntryById);

// PUT /api/time-entries/:id - Update time entry
router.put('/:id', timeEntryController.updateTimeEntry);

// DELETE /api/time-entries/:id - Delete time entry
router.delete('/:id', timeEntryController.deleteTimeEntry);

module.exports = router;