const express = require('express'); 
const router = express.Router(); 
const taskController = require('../../controllers/crm/TaskController'); 

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// GET /api/tasks/project/:projectId/team-members - Get project team members
router.get('/project/:projectId/team-members', taskController.getProjectTeamMembers);

// GET /api/tasks - Get all tasks
router.get('/', taskController.getTasks);

// POST /api/tasks - Create new task
router.post('/', taskController.createTask);

// GET /api/tasks/:id - Get task by ID (This must come AFTER specific routes)
router.get('/:id', taskController.getTaskById);

// PUT /api/tasks/:id - Update task
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;