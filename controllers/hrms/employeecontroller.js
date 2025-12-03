const Employee = require("../../models/hrms/employee");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const UserCompany = require('../../models/UserCompany');

const faceUtils = require('../../utils/faceUtils');
exports.createFaculty = async (req, res) => {
  try {
    let { email, password, branches, employeeId,companyId, ...otherData } = req.body;
    const plainPassword = password;
console.log('emp',req.body)
    if (typeof otherData.role === 'string') {
      try { otherData.role = JSON.parse(otherData.role); } catch {}
    }

    if (typeof otherData.subjects === 'string') {
      try { otherData.subjects = JSON.parse(otherData.subjects); } catch {}
    }

    const existingFaculty = await Employee.findOne({ email });
    if (existingFaculty) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password) {
      const saltRounds = 10;
      password = await bcrypt.hash(password, saltRounds);
    }

    const profilePhoto = req.file ? `profile/${req.file.filename}` : null;
    const branchId = branches;

         
    const faculty = new Employee({
      ...otherData,
      email,
      password,
      companyId,
      branchId,
      employeeId,
      profilePhoto
    });

    await faculty.save();
     
 const userCompany = new UserCompany({
      userId: faculty._id, // employee's ObjectId
      companyId
    });

    await userCompany.save();
    // if (email && plainPassword && (otherData.name || otherData.firstName)) {
    //   try {
    //     await sendWelcomeEmail(email, plainPassword, otherData.name || otherData.firstName);
    //   } catch (emailError) {
    //     console.error("Email sending failed:", emailError.message);
    //   }
    // }

    res.status(201).json({ message: "Faculty added successfully", faculty });
  } catch (error) {
    console.error("Error creating faculty:", error); 
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const existingFaculty = await Employee.findById(req.params.id);
    if (!existingFaculty) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Faculty not found" });
    }

    let updateData = { ...req.body };

    if (updateData.branches) {
      updateData.branchId = updateData.branches;
      delete updateData.branches;
    }

    if (!updateData.MasterBranchID || updateData.MasterBranchID === "undefined") {
      delete updateData.MasterBranchID;
    }

    if (typeof updateData.role === "string") {
      try { updateData.role = JSON.parse(updateData.role); } catch {}
    }

    if (typeof updateData.subjects === "string") {
      try { updateData.subjects = JSON.parse(updateData.subjects); } catch {}
    }

    if (req.file) {
      if (existingFaculty.profilePhoto) {
        const oldPhotoPath = path.join("uploads", existingFaculty.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }
      updateData.profilePhoto = `profile/${req.file.filename}`;
    }

    if (updateData.password && updateData.password.trim() !== '') {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const faculty = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Faculty updated successfully", faculty });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllFaculties = async (req, res) => {
  try {
   const { companyId} = req.query;
console.log("faculty companyid", companyId)
    const filter = {};
     if (companyId) filter.companyId = companyId;
    // if (financialYear) filter.financialYear = financialYear;

    const faculties =  await Employee.find(filter)
    console.log("comapnies", faculties)
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
};

exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Employee.findById(req.params.userId);
    if (!faculty) return res.status(404).json({ success: false, message: "Faculty not found" });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete faculty" });
  }
};




// const employeeController = {

//   // Get employee by employeeId
// getEmployeeById: async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     console.log(`Fetching employee with ID: ${employeeId}`);

//     const employee = await Employee.findOne({
//       employeeId: employeeId,
//       isActive: true
//     }).select('employeeId firstName lastName createdAt');

//     if (!employee) {
//       return res.status(404).json({
//         error: "Employee not found",
//         message: `No employee found with ID: ${employeeId}`
//       });
//     }

//     const responseData = {
//       employeeId: employee.employeeId,
//       name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
//       createdAt: employee.createdAt
//     };

//     // ✅ Log the exact JSON response
//     console.log("✅ Sending Response:", JSON.stringify(responseData, null, 2));

//     res.json(responseData);

//   } catch (error) {
//     console.error("Error fetching employee:", error);
//     res.status(500).json({
//       error: "Error fetching employee",
//       details: error.message
//     });
//   }
// },
//   // Register new employee or update existing one
//   registerEmployee: async (req, res) => {
//     const { employeeId, name, descriptor} = req.body;
   
//     try {
//       // Enhanced validation
//       if (!employeeId || !name || !descriptor) {
//         return res.status(400).json({
//           error: "Employee ID, name and face descriptor are required"
//         });
//       }
      
//       if (!Array.isArray(descriptor) || descriptor.length !== 128) {
//         return res.status(400).json({
//           error: "Invalid face descriptor format. Expected array of 128 numbers."
//         });
//       }
      
//       // Validate descriptor values
//       const invalidValues = descriptor.filter(val => isNaN(parseFloat(val)));
//       if (invalidValues.length > 0) {
//         return res.status(400).json({
//           error: "Descriptor contains invalid numeric values"
//         });
//       }
      
//       console.log(`Processing employee: ${name} (ID: ${employeeId})`);
//       console.log(`Descriptor validation: length=${descriptor.length}, first 3 values=[${descriptor.slice(0, 3).map(v => parseFloat(v).toFixed(3)).join(', ')}]`);
      
//       // Convert to float array for consistency
//       const processedDescriptor = descriptor.map(num => parseFloat(num));
      
//       // Check for duplicates BEFORE saving (unless updating same employee)
//       const existingEmployee = await Employee.findOne({ 
//         employeeId: employeeId.trim() 
        
//       });
      
//       if (!existingEmployee) {
//         // New employee - check for face duplicates
//         console.log("New employee registration - checking for face duplicates...");
//         const duplicateCheck = await employeeController.checkDuplicateFace(processedDescriptor);
        
//         if (duplicateCheck.isDuplicate) {
//           return res.status(400).json({
//             error: "Duplicate face detected",
//             message: duplicateCheck.message,
//             details: duplicateCheck
//           });
//         }
//       }
      
//       if (existingEmployee) {
//         // Update existing employee
//         console.log(`Updating existing employee: ${existingEmployee.name} (ID: ${employeeId})`);
        
//         existingEmployee.descriptor = processedDescriptor;
//        existingEmployee.firstName = name.split(" ")[0];
// existingEmployee.lastName = name.split(" ").slice(1).join(" ");

      
//         existingEmployee.isActive = true;
        
//         await existingEmployee.save();
        
//         console.log(`✅ Employee face data updated successfully: ${existingEmployee._id}`);
        
//         return res.json({
//           message: "✅ Employee face data updated successfully",
//           action: "updated",
//           employee: {
//             _id: existingEmployee._id,
//             employeeId: existingEmployee.employeeId,
//             name: existingEmployee.name,
//             updatedAt: existingEmployee.updatedAt,
//             createdAt: existingEmployee.createdAt
//           }
//         });
//       } else {
//         // Create new employee
//         console.log(`Creating new employee: ${name} (ID: ${employeeId})`);
        
//         const employee = new Employee({
//           employeeId: employeeId.trim(),
//           name: name.trim(),
//           descriptor: processedDescriptor,
      
//           isActive: true
//         });
       
//         await employee.save();
       
//         console.log(`✅ New employee face registered successfully: ${employee._id}`);
       
//         return res.json({
//           message: "✅ New employee face registered successfully",
//           action: "created",
//           employee: {
//             _id: employee._id,
//             employeeId: employee.employeeId,
//             name: employee.name,
//             createdAt: employee.createdAt
//           }
//         });
//       }
      
//     } catch (error) {
//       console.error("Registration error:", error);
      
//       if (error.code === 11000) {
//         return res.status(400).json({
//           error: "Employee ID already exists",
//           message: "An employee with this ID is already registered."
//         });
//       }
      
//       res.status(500).json({
//         error: "❌ Error processing employee registration",
//         details: error.message
//       });
//     }
//   },

//   // Get all employees for face matching
//   // getAllEmployees: async (req, res) => {
//   //   try {
//   //     const employees = await Employee.find({}, 'name descriptor  createdAt').lean();
      
//   //     console.log(`📋 Fetching ${employees.length} employees`);
      
//   //     // Filter out employees with invalid descriptors and process valid ones
//   //     const processedEmployees = employees
//   //       .filter(emp => {
//   //         if (!emp.descriptor || !Array.isArray(emp.descriptor) || emp.descriptor.length !== 128) {
//   //           console.warn(`⚠️ Employee ${emp.name} (${emp._id}) has invalid descriptor:`, {
//   //             hasDescriptor: !!emp.descriptor,
//   //             isArray: Array.isArray(emp.descriptor),
//   //             length: emp.descriptor ? emp.descriptor.length : 'N/A'
//   //           });
//   //           return false;
//   //         }
//   //         return true;
//   //       })
//   //       .map(emp => ({
//   //         ...emp,
//   //         descriptor: emp.descriptor.map(num => parseFloat(num))
//   //       }));
      
//   //     console.log(`✅ Returning ${processedEmployees.length} valid employees out of ${employees.length} total`);
      
//   //     if (processedEmployees.length === 0 && employees.length > 0) {
//   //       console.warn("⚠️ All employees have invalid descriptors. You may need to re-register them.");
//   //     }
      
//   //     res.json(processedEmployees);
//   //   } catch (err) {
//   //     console.error("Error fetching employees:", err);
//   //     res.status(500).json({ 
//   //       error: "❌ Error fetching employees",
//   //       details: err.message 
//   //     });
//   //   }
//   // },
// getAllEmployees: async (req, res) => {
//   try {
//     // Fetch employees with firstName, lastName, descriptor, createdAt
//     const employees = await Employee.find({}, 'firstName lastName descriptor createdAt').lean();
    
//     console.log(`📋 Fetching ${employees.length} employees`);
    
//     // Filter + Process
//     const processedEmployees = employees
//       .filter(emp => {
//         if (!emp.descriptor || !Array.isArray(emp.descriptor) || emp.descriptor.length !== 128) {
//           console.warn(`⚠️ Employee ${emp.firstName} ${emp.lastName} (${emp._id}) has invalid descriptor:`, {
//             hasDescriptor: !!emp.descriptor,
//             isArray: Array.isArray(emp.descriptor),
//             length: emp.descriptor ? emp.descriptor.length : 'N/A'
//           });
//           return false;
//         }
//         return true;
//       })
//       .map(emp => ({
//         ...emp,
//         name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(), // 👈 Combine firstName + lastName
//         descriptor: emp.descriptor.map(num => parseFloat(num))
//       }));
    
//     console.log(`✅ Returning ${processedEmployees.length} valid employees out of ${employees.length} total`);
    
//     if (processedEmployees.length === 0 && employees.length > 0) {
//       console.warn("⚠️ All employees have invalid descriptors. You may need to re-register them.");
//     }
    
//     res.json(processedEmployees);
//   } catch (err) {
//     console.error("Error fetching employees:", err);
//     res.status(500).json({ 
//       error: "❌ Error fetching employees",
//       details: err.message 
//     });
//   }
// },

//   // Delete employee
//   deleteEmployee: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const employee = await Employee.findByIdAndDelete(id);
      
//       if (!employee) {
//         return res.status(404).json({ error: "Employee not found" });
//       }

//       // Also delete their attendance records
//       const Attendance = require('../models/Attendance');
//       await Attendance.deleteMany({ employeeId: id });
      
//       res.json({ 
//         message: "Employee and attendance records deleted",
//         deletedEmployee: {
//           _id: employee._id,
//           name: employee.name,
//           employeeId: employee.employeeId
//         }
//       });
//     } catch (error) {
//       console.error("Delete error:", error);
//       res.status(500).json({ error: "Error deleting employee" });
//     }
//   },

//   // Check for duplicate faces
//   checkDuplicateFaceAPI: async (req, res) => {
//     try {
//       const { descriptor } = req.body;
      
//       if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
//         return res.status(400).json({
//           error: "Invalid face descriptor format. Expected array of 128 numbers."
//         });
//       }
      
//       const result = await employeeController.checkDuplicateFace(descriptor);
//       res.json(result);
      
//     } catch (error) {
//       console.error("Error checking duplicates:", error);
//       return res.status(500).json({
//         error: "Error checking for duplicates",
//         details: error.message
//       });
//     }
//   },

//   // Helper function for duplicate checking
//   checkDuplicateFace: async (newDescriptor) => {
//     try {
//       const employees = await Employee.find({
//         descriptor: { $exists: true, $ne: null },
//         $expr: { $eq: [{ $size: "$descriptor" }, 128] },
//         isActive: true
//       }).select('employeeId name descriptor').lean();
      
//       if (employees.length === 0) {
//         return {
//           isDuplicate: false,
//           message: "No existing employees with face data to compare with.",
//           similarity: 0
//         };
//       }
      
//       console.log(`Comparing against ${employees.length} registered faces...`);
      
//       // Calculate distances for all employees
//       let closestMatch = null;
//       let closestDistance = Infinity;
//       let allMatches = [];
      
//       for (const employee of employees) {
//         try {
//           // Ensure employee descriptor is valid
//           if (!employee.descriptor || employee.descriptor.length !== 128) {
//             console.warn(`Skipping employee ${employee.name} - invalid descriptor`);
//             continue;
//           }
          
//           const distance = faceUtils.calculateEuclideanDistance(newDescriptor, employee.descriptor);
//           const similarity = Math.max(0, (1 - distance / 2) * 100);
          
//          allMatches.push({
//   employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
//   employeeId: employee.employeeId,
//   distance,
//   similarity
// });

          
//           console.log(`Employee ${employee.name} (${employee.employeeId}): distance=${distance.toFixed(3)}, similarity=${similarity.toFixed(1)}%`);
          
//           if (distance < closestDistance) {
//             closestDistance = distance;
//             closestMatch = {
//               employee,
//               distance,
//               similarity
//             };
//           }
//         } catch (error) {
//           console.error(`Error comparing with employee ${employee.name}:`, error);
//         }
//       }
      
//       if (!closestMatch) {
//         return {
//           isDuplicate: false,
//           message: "No valid employees found for comparison.",
//           similarity: 0
//         };
//       }
      
//       const DUPLICATE_THRESHOLD = 0.6;
//       const isDuplicate = closestDistance < DUPLICATE_THRESHOLD;
      
//       console.log(`Closest match: ${closestMatch.employee.name}, distance: ${closestDistance.toFixed(3)}, similarity: ${closestMatch.similarity.toFixed(1)}%`);
//       console.log(`Duplicate detected: ${isDuplicate} (threshold: ${DUPLICATE_THRESHOLD})`);
      
//       // Sort all matches by similarity for detailed logging
//       allMatches.sort((a, b) => b.similarity - a.similarity);
//       console.log("Top 3 matches:", allMatches.slice(0, 3).map(m => 
//         `${m.employeeName}: ${m.similarity.toFixed(1)}%`
//       ));
      
//       if (isDuplicate) {
//         return {
//           isDuplicate: true,
//           employeeName: closestMatch.employee.name,
//           employeeId: closestMatch.employee.employeeId,
//           similarity: closestMatch.similarity.toFixed(1),
//           distance: closestDistance.toFixed(3),
//           threshold: DUPLICATE_THRESHOLD,
//           message: `Face matches existing employee: ${closestMatch.employee.name} (ID: ${closestMatch.employee.employeeId}) - ${closestMatch.similarity.toFixed(1)}% similarity`,
//           allMatches: allMatches.slice(0, 5) // Top 5 matches for debugging
//         };
//       } else {
//         return {
//           isDuplicate: false,
//           message: `No duplicate found. Face is unique (closest match: ${closestMatch.similarity.toFixed(1)}% similarity with ${closestMatch.employee.name})`,
//           similarity: closestMatch.similarity.toFixed(1),
//           distance: closestDistance.toFixed(3),
//           threshold: DUPLICATE_THRESHOLD,
//           closestMatch: {
//             employeeName: closestMatch.employee.name,
//             employeeId: closestMatch.employee.employeeId,
//             similarity: closestMatch.similarity.toFixed(1)
//           }
//         };
//       }
      
//     } catch (error) {
//       console.error("Error in duplicate checking:", error);
//       return {
//         isDuplicate: false,
//         message: "Error checking duplicates. Proceeding anyway.",
//         error: error.message
//       };
//     }
//   },

//   // Clean up invalid employees
//   cleanupInvalidEmployees: async (req, res) => {
//     try {
//       const employees = await Employee.find({}).lean();
      
//       const invalidEmployees = employees.filter(emp => 
//         !emp.descriptor || 
//         !Array.isArray(emp.descriptor) || 
//         emp.descriptor.length !== 128
//       );
      
//       if (invalidEmployees.length === 0) {
//         return res.json({ 
//           message: "No invalid employees found",
//           totalEmployees: employees.length,
//           validEmployees: employees.length
//         });
//       }
      
//       // Delete invalid employees
//       const deleteResult = await Employee.deleteMany({
//         _id: { $in: invalidEmployees.map(emp => emp._id) }
//       });
      
//       // Delete their attendance records too
//       const Attendance = require('../models/Attendance');
//       await Attendance.deleteMany({
//         employeeId: { $in: invalidEmployees.map(emp => emp._id) }
//       });
      
//       console.log(`🧹 Cleaned up ${deleteResult.deletedCount} invalid employees`);
      
//       res.json({
//         message: `Cleaned up ${deleteResult.deletedCount} invalid employees`,
//         invalidEmployees: invalidEmployees.map(emp => ({
//           name: emp.name,
//           id: emp._id,
//           descriptorIssue: !emp.descriptor ? "Missing descriptor" : 
//                            !Array.isArray(emp.descriptor) ? "Descriptor not array" :
//                            `Wrong length: ${emp.descriptor.length} (should be 128)`
//         })),
//         totalEmployees: employees.length,
//         validEmployees: employees.length - invalidEmployees.length
//       });
//     } catch (error) {
//       console.error("Cleanup error:", error);
//       res.status(500).json({ error: "Error during cleanup" });
//     }
//   }

// };

const employeeController = {

  // Get employee by employeeId
  getEmployeeById: async (req, res) => {
    try {
      const { employeeId } = req.params;

      console.log(`Fetching employee with ID: ${employeeId}`);

      const employee = await Employee.findOne({
        employeeId: employeeId,
        isActive: true
      }).select('employeeId firstName lastName createdAt');

      if (!employee) {
        return res.status(404).json({
          error: "Employee not found",
          message: `No employee found with ID: ${employeeId}`
        });
      }

      const responseData = {
        employeeId: employee.employeeId,
        name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
        createdAt: employee.createdAt
      };

      console.log("Sending Response:", JSON.stringify(responseData, null, 2));

      res.json(responseData);

    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({
        error: "Error fetching employee",
        details: error.message
      });
    }
  },

  // Register new employee or update existing one
  registerEmployee: async (req, res) => {
    const { employeeId, name, descriptor } = req.body;
   
    try {
      // Enhanced validation
      if (!employeeId || !name || !descriptor) {
        return res.status(400).json({
          error: "Employee ID, name and face descriptor are required"
        });
      }
      
      if (!Array.isArray(descriptor) || descriptor.length !== 128) {
        return res.status(400).json({
          error: "Invalid face descriptor format. Expected array of 128 numbers."
        });
      }
      
      // Validate descriptor values
      const invalidValues = descriptor.filter(val => isNaN(parseFloat(val)));
      if (invalidValues.length > 0) {
        return res.status(400).json({
          error: "Descriptor contains invalid numeric values"
        });
      }
      
      console.log(`Processing employee: ${name} (ID: ${employeeId})`);
      console.log(`Descriptor validation: length=${descriptor.length}, first 3 values=[${descriptor.slice(0, 3).map(v => parseFloat(v).toFixed(3)).join(', ')}]`);
      
      // Convert to float array for consistency
      const processedDescriptor = descriptor.map(num => parseFloat(num));
      
      // Check for duplicates BEFORE saving (unless updating same employee)
      const existingEmployee = await Employee.findOne({ 
        employeeId: employeeId.trim() 
      });
      
      if (!existingEmployee) {
        // New employee - check for face duplicates
        console.log("New employee registration - checking for face duplicates...");
        const duplicateCheck = await employeeController.checkDuplicateFace(processedDescriptor);
        
        if (duplicateCheck.isDuplicate) {
          return res.status(400).json({
            error: "Duplicate face detected",
            message: duplicateCheck.message,
            details: duplicateCheck
          });
        }
      }
      
      if (existingEmployee) {
        // Update existing employee
        console.log(`Updating existing employee: ${existingEmployee.firstName} ${existingEmployee.lastName} (ID: ${employeeId})`);
        
        existingEmployee.descriptor = processedDescriptor;
        existingEmployee.firstName = name.split(" ")[0];
        existingEmployee.lastName = name.split(" ").slice(1).join(" ");
        existingEmployee.isActive = true;
        
        await existingEmployee.save();
        
        console.log(`Employee face data updated successfully: ${existingEmployee._id}`);
        
        return res.json({
          message: "Employee face data updated successfully",
          action: "updated",
          employee: {
            _id: existingEmployee._id,
            employeeId: existingEmployee.employeeId,
            name: `${existingEmployee.firstName} ${existingEmployee.lastName}`.trim(),
            updatedAt: existingEmployee.updatedAt,
            createdAt: existingEmployee.createdAt
          }
        });
      } else {
        // Create new employee
        console.log(`Creating new employee: ${name} (ID: ${employeeId})`);
        
        const employee = new Employee({
          employeeId: employeeId.trim(),
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" "),
          descriptor: processedDescriptor,
          isActive: true
        });
       
        await employee.save();
       
        console.log(`New employee face registered successfully: ${employee._id}`);
       
        return res.json({
          message: "New employee face registered successfully",
          action: "created",
          employee: {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: `${employee.firstName} ${employee.lastName}`.trim(),
            createdAt: employee.createdAt
          }
        });
      }
      
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          error: "Employee ID already exists",
          message: "An employee with this ID is already registered."
        });
      }
      
      res.status(500).json({
        error: "Error processing employee registration",
        details: error.message
      });
    }
  },

 // Fixed getAllEmployees function
getAllEmployees: async (req, res) => {
  try {
    console.log("Starting getAllEmployees...");
    
    // Build filter object properly
    const filter = { 
      isActive: true,
      employeeId: { $exists: true, $ne: null, $ne: "" }
    };
    
    // Add companyId filter if provided
    const { companyId } = req.query;
    if (companyId) {
      filter.companyId = companyId;
      console.log("Filtering by companyId:", companyId);
    }
    // Only add descriptor filter if we need employees with face data
    // If you want ALL employees regardless of face data, remove these lines:
    filter.descriptor = { $exists: true, $ne: null };
    filter.$expr = { $eq: [{ $size: "$descriptor" }, 128] };
    
    console.log("Filter being used:", JSON.stringify(filter, null, 2));
    
    // Fetch employees with proper field selection
    const employees = await Employee.find(filter)
      .select('employeeId firstName lastName descriptor createdAt')
      .lean();
    
    console.log(`Found ${employees.length} employees in database`);
    
    if (employees.length > 0) {
      console.log("Sample employee structure:", {
        _id: employees[0]._id,
        employeeId: employees[0].employeeId,
        firstName: employees[0].firstName,
        lastName: employees[0].lastName,
        hasDescriptor: !!employees[0].descriptor,
        descriptorLength: employees[0].descriptor ? employees[0].descriptor.length : 'N/A'
      });
    }
    
    // Process employees with better error handling
    const processedEmployees = [];
    
    for (const emp of employees) {
      try {
        // Check required fields
        if (!emp.employeeId) {
          console.warn(`Skipping employee ${emp._id} - missing employeeId`);
          continue;
        }
        
        if (!emp.firstName) {
          console.warn(`Skipping employee ${emp.employeeId} - missing firstName`);
          continue;
        }
        
        // If requiring face descriptors, validate them
        if (emp.descriptor) {
          if (!Array.isArray(emp.descriptor)) {
            console.warn(`Skipping employee ${emp.firstName} ${emp.lastName} - descriptor not an array`);
            continue;
          }
          
          if (emp.descriptor.length !== 128) {
            console.warn(`Skipping employee ${emp.firstName} ${emp.lastName} - descriptor length is ${emp.descriptor.length}, expected 128`);
            continue;
          }
          
          // Validate descriptor values
          const hasInvalidValues = emp.descriptor.some(val => isNaN(parseFloat(val)) || !isFinite(parseFloat(val)));
          if (hasInvalidValues) {
            console.warn(`Skipping employee ${emp.firstName} ${emp.lastName} - descriptor contains invalid values`);
            continue;
          }
        }
        
        // Build processed employee object
        const processedEmp = {
          _id: emp._id,
          employeeId: emp.employeeId,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          firstName: emp.firstName,
          lastName: emp.lastName || '',
          createdAt: emp.createdAt
        };
        
        // Add descriptor if it exists and is valid
        if (emp.descriptor && Array.isArray(emp.descriptor) && emp.descriptor.length === 128) {
          processedEmp.descriptor = emp.descriptor.map(num => parseFloat(num));
        }
        
        processedEmployees.push(processedEmp);
        
      } catch (processingError) {
        console.error(`Error processing employee ${emp._id}:`, processingError);
        // Continue with other employees instead of failing completely
        continue;
      }
    }
    
    console.log(`Successfully processed ${processedEmployees.length} employees out of ${employees.length} total`);
    
    if (processedEmployees.length === 0 && employees.length > 0) {
      console.warn("No valid employees found after processing. Check data integrity.");
      return res.status(200).json({
        message: "No valid employees found",
        totalFound: employees.length,
        validEmployees: 0,
        employees: []
      });
    }
    
    // Return success response
    res.status(200).json(processedEmployees);
    
  } catch (error) {
    console.error("Error in getAllEmployees:", error);
    
    // Provide more specific error information
    const errorResponse = {
      error: "Error fetching employees",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      errorResponse.error = "Database query error - invalid data format";
    } else if (error.name === 'ValidationError') {
      errorResponse.error = "Data validation error";
    } else if (error.code === 11000) {
      errorResponse.error = "Duplicate key error";
    }
    
    res.status(500).json(errorResponse);
  }
},

  // Delete employee
  deleteEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findByIdAndDelete(id);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Also delete their attendance records
      const Attendance = require('../../models/Attendance');
      await Attendance.deleteMany({ employeeId: id });
      
      res.json({ 
        message: "Employee and attendance records deleted",
        deletedEmployee: {
          _id: employee._id,
          name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
          employeeId: employee.employeeId
        }
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Error deleting employee" });
    }
  },

  // Check for duplicate faces API endpoint
  checkDuplicateFaceAPI: async (req, res) => {
    try {
      const { descriptor } = req.body;
      
      if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
        return res.status(400).json({
          error: "Invalid face descriptor format. Expected array of 128 numbers."
        });
      }
      
      const result = await employeeController.checkDuplicateFace(descriptor);
      res.json(result);
      
    } catch (error) {
      console.error("Error checking duplicates:", error);
      return res.status(500).json({
        error: "Error checking for duplicates",
        details: error.message
      });
    }
  },

  // Helper function for duplicate checking
  checkDuplicateFace: async (newDescriptor) => {
    try {
      const employees = await Employee.find({
        descriptor: { $exists: true, $ne: null },
        $expr: { $eq: [{ $size: "$descriptor" }, 128] },
        isActive: true
      }).select('employeeId firstName lastName descriptor').lean();
      
      if (employees.length === 0) {
        return {
          isDuplicate: false,
          message: "No existing employees with face data to compare with.",
          similarity: 0
        };
      }
      
      console.log(`Comparing against ${employees.length} registered faces...`);
      
      let closestMatch = null;
      let closestDistance = Infinity;
      let allMatches = [];
      
      for (const employee of employees) {
        try {
          if (!employee.descriptor || employee.descriptor.length !== 128) {
            console.warn(`Skipping employee ${employee.firstName} ${employee.lastName} - invalid descriptor`);
            continue;
          }
          
          const distance = faceUtils.calculateEuclideanDistance(newDescriptor, employee.descriptor);
          const similarity = Math.max(0, (1 - distance / 2) * 100);
          
          const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
          
          allMatches.push({
            employeeName: employeeName,
            employeeId: employee.employeeId,
            distance,
            similarity
          });
          
          console.log(`Employee ${employeeName} (${employee.employeeId}): distance=${distance.toFixed(3)}, similarity=${similarity.toFixed(1)}%`);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestMatch = {
              employee: {
                ...employee,
                name: employeeName
              },
              distance,
              similarity
            };
          }
        } catch (error) {
          console.error(`Error comparing with employee ${employee.firstName} ${employee.lastName}:`, error);
        }
      }
      
      if (!closestMatch) {
        return {
          isDuplicate: false,
          message: "No valid employees found for comparison.",
          similarity: 0
        };
      }
      
      const DUPLICATE_THRESHOLD = 0.6;
      const isDuplicate = closestDistance < DUPLICATE_THRESHOLD;
      
      console.log(`Closest match: ${closestMatch.employee.name}, distance: ${closestDistance.toFixed(3)}, similarity: ${closestMatch.similarity.toFixed(1)}%`);
      console.log(`Duplicate detected: ${isDuplicate} (threshold: ${DUPLICATE_THRESHOLD})`);
      
      allMatches.sort((a, b) => b.similarity - a.similarity);
      console.log("Top 3 matches:", allMatches.slice(0, 3).map(m => 
        `${m.employeeName}: ${m.similarity.toFixed(1)}%`
      ));
      
      if (isDuplicate) {
        return {
          isDuplicate: true,
          employeeName: closestMatch.employee.name,
          employeeId: closestMatch.employee.employeeId,
          similarity: closestMatch.similarity.toFixed(1),
          distance: closestDistance.toFixed(3),
          threshold: DUPLICATE_THRESHOLD,
          message: `Face matches existing employee: ${closestMatch.employee.name} (ID: ${closestMatch.employee.employeeId}) - ${closestMatch.similarity.toFixed(1)}% similarity`,
          allMatches: allMatches.slice(0, 5)
        };
      } else {
        return {
          isDuplicate: false,
          message: `No duplicate found. Face is unique (closest match: ${closestMatch.similarity.toFixed(1)}% similarity with ${closestMatch.employee.name})`,
          similarity: closestMatch.similarity.toFixed(1),
          distance: closestDistance.toFixed(3),
          threshold: DUPLICATE_THRESHOLD,
          closestMatch: {
            employeeName: closestMatch.employee.name,
            employeeId: closestMatch.employee.employeeId,
            similarity: closestMatch.similarity.toFixed(1)
          }
        };
      }
      
    } catch (error) {
      console.error("Error in duplicate checking:", error);
      return {
        isDuplicate: false,
        message: "Error checking duplicates. Proceeding anyway.",
        error: error.message
      };
    }
  },

  // Clean up invalid employees
  cleanupInvalidEmployees: async (req, res) => {
    try {
      const employees = await Employee.find({}).lean();
      
      const invalidEmployees = employees.filter(emp => 
        !emp.descriptor || 
        !Array.isArray(emp.descriptor) || 
        emp.descriptor.length !== 128
      );
      
      if (invalidEmployees.length === 0) {
        return res.json({ 
          message: "No invalid employees found",
          totalEmployees: employees.length,
          validEmployees: employees.length
        });
      }
      
      const deleteResult = await Employee.deleteMany({
        _id: { $in: invalidEmployees.map(emp => emp._id) }
      });
      
      const Attendance = require('../../models/Attendance');
      await Attendance.deleteMany({
        employeeId: { $in: invalidEmployees.map(emp => emp._id) }
      });
      
      console.log(`Cleaned up ${deleteResult.deletedCount} invalid employees`);
      
      res.json({
        message: `Cleaned up ${deleteResult.deletedCount} invalid employees`,
        invalidEmployees: invalidEmployees.map(emp => ({
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
          id: emp._id,
          descriptorIssue: !emp.descriptor ? "Missing descriptor" : 
                           !Array.isArray(emp.descriptor) ? "Descriptor not array" :
                           `Wrong length: ${emp.descriptor.length} (should be 128)`
        })),
        totalEmployees: employees.length,
        validEmployees: employees.length - invalidEmployees.length
      });
    } catch (error) {
      console.error("Cleanup error:", error);
      res.status(500).json({ error: "Error during cleanup" });
    }
  }

};
// Export both faculty functions and employeeController object
module.exports = {
  createFaculty: exports.createFaculty,
  updateFaculty: exports.updateFaculty,
  getAllFaculties: exports.getAllFaculties,
  getFacultyById: exports.getFacultyById,
  deleteFaculty: exports.deleteFaculty,
  ...employeeController
};
