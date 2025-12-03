const express = require("express");
const router = express.Router();
const facultyController = require("../../controllers/hrms/employeecontroller");
//const upload = require("../middleware/uploadMiddleware"); // Your multer config
router.get('/employees', facultyController.getAllEmployees);
// router.post("/", upload.single("profilePhoto"), facultyController.createFaculty);
// router.put("/:id", upload.single("profilePhoto"), facultyController.updateFaculty);
router.post("/",  facultyController.createFaculty);
router.put("/:id",  facultyController.updateFaculty);
router.get("/", facultyController.getAllFaculties);
router.get("/:userId", facultyController.getFacultyById);
router.delete("/:id", facultyController.deleteFaculty);
router.get('/employee/:employeeId', facultyController.getEmployeeById);

// Register new employee or update existing one
router.post('/employee/register', facultyController.registerEmployee);

// Get all employees for face matching


// Delete employee by ID
router.delete('/employee/:id', facultyController.deleteEmployee);

// Check for duplicate faces
router.post('/face/check-duplicate', facultyController.checkDuplicateFaceAPI);

// Clean up invalid employees
router.post('/cleanup/invalid-employees', facultyController.cleanupInvalidEmployees);
module.exports = router;
