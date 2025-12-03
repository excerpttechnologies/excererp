const Task = require('../../models/crm/Task');

const taskController = {
  // Get all tasks
  getTasks: async (req, res) => {
    try {
      const { companyId } = req.query;
      const tasks = await Task.find({ companyId})
        .populate('projectId', 'projectName')
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new task
  createTask: async (req, res) => {
    try {
      const task = new Task(req.body);
      await task.save();
      await task.populate('projectId', 'projectName');
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get task by ID
  getTaskById: async (req, res) => {
    try {
      const task = await Task.findById(req.params.id).populate('projectId', 'projectName');
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update task
  updateTask: async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('projectId', 'projectName');
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete task
  deleteTask: async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = taskController;