// const Task = require('../../models/crm/Task');

// const taskController = {
//   // Get all tasks
//   getTasks: async (req, res) => {
//     try {
//       const { companyId } = req.query;
//       const tasks = await Task.find({ companyId})
//         .populate('projectId', 'projectName')
//         .sort({ createdAt: -1 });
//       res.json(tasks);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new task
//   createTask: async (req, res) => {
//     try {
//       const task = new Task(req.body);
//       await task.save();
//       await task.populate('projectId', 'projectName');
//       res.status(201).json(task);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get task by ID
//   getTaskById: async (req, res) => {
//     try {
//       const task = await Task.findById(req.params.id).populate('projectId', 'projectName');
//       if (!task) {
//         return res.status(404).json({ error: 'Task not found' });
//       }
//       res.json(task);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update task
//   updateTask: async (req, res) => {
//     try {
//       const task = await Task.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       ).populate('projectId', 'projectName');
//       if (!task) {
//         return res.status(404).json({ error: 'Task not found' });
//       }
//       res.json(task);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete task
//   deleteTask: async (req, res) => {
//     try {
//       const task = await Task.findByIdAndDelete(req.params.id);
//       if (!task) {
//         return res.status(404).json({ error: 'Task not found' });
//       }
//       res.json({ message: 'Task deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = taskController;


const Task = require('../../models/crm/Task');
const Project = require('../../models/crm/Project');

const taskController = {
  // Get all tasks
  getTasks: async (req, res) => {
    try {
      const { companyId } = req.query;
      const tasks = await Task.find({ companyId})
        .populate('projectId', 'projectName')
        .populate('assignedTo', 'firstName lastName email employeeId department profilePhoto')
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
      await task.populate('assignedTo', 'firstName lastName email employeeId department profilePhoto');
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get task by ID
  getTaskById: async (req, res) => {
    try {
      console.log("Fetching task with ID:", req.params.id);
      const task = await Task.findById(req.params.id)
        .populate('projectId', 'projectName')
        .populate('assignedTo', 'firstName lastName email employeeId department profilePhoto');
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
      console.log("Task found:", task);
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
      )
        .populate('projectId', 'projectName')
        .populate('assignedTo', 'firstName lastName email employeeId department profilePhoto');
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
  },

  // Get project team members - FIXED VERSION
  getProjectTeamMembers: async (req, res) => {
    try {
      const { projectId } = req.params;
      console.log("Fetching team members for project ID:", projectId);
      
      // Add validation
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }

      const project = await Project.findById(projectId)
        .populate('projectManager', 'firstName lastName email employeeId department profilePhoto')
        .populate('teamMembers', 'firstName lastName email employeeId department profilePhoto');
      
      console.log("Found project:", project);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Combine project manager and team members - FIXED
      const allTeamMembers = [];
      
      // Handle projectManager array properly
      if (project.projectManager && project.projectManager.length > 0) {
        allTeamMembers.push(...project.projectManager); // Use spread operator to add each manager
      }
      
      // Handle teamMembers array
      if (project.teamMembers && project.teamMembers.length > 0) {
        allTeamMembers.push(...project.teamMembers);
      }

      // Remove duplicates (in case project manager is also in team members)
      const uniqueTeamMembers = allTeamMembers.filter((member, index, self) =>
        index === self.findIndex(m => m._id.toString() === member._id.toString())
      );

      console.log("Returning team members:", uniqueTeamMembers);
      res.json(uniqueTeamMembers);
    } catch (error) {
      console.error("Error in getProjectTeamMembers:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = taskController;