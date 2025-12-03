const express = require('express');
const router = express.Router();
const departmentController = require('../../controllers/hrms/department');
router.post('/departments/', departmentController.createDepartment);

// PUT: Update department
router.put('/departments/:id', departmentController.updateDepartment);

// DELETE: Delete department
router.delete('/departments/:id', departmentController.deleteDepartment);
router.get('/departments', departmentController.getAllDepartments);

module.exports = router;
