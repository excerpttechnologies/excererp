const express = require('express');
const router = express.Router();
const milestoneController = require('../../controllers/crm/MilestoneController');

// GET /api/milestones - Get all milestones
router.get('/', milestoneController.getMilestones);

// POST /api/milestones - Create new milestone
router.post('/', milestoneController.createMilestone);

// GET /api/milestones/:id - Get milestone by ID
router.get('/:id', milestoneController.getMilestoneById);

// PUT /api/milestones/:id - Update milestone
router.put('/:id', milestoneController.updateMilestone);

// DELETE /api/milestones/:id - Delete milestone
router.delete('/:id', milestoneController.deleteMilestone);

module.exports = router;