const Role = require('../models/Roles');




function organizePermissions(permissions) {


  const permissionsStructure = {
    "Dashboard": ["Dashboard"],
    "Master Data": [
      "Material Master", "Customer Master", "Vendor Master",
      "Customer Price List", "Vendor Price List", "Tax List",
      "Location Master", "Process List Master", "General Condition Master"
    ],
    "MRP": ["MRP"],
    "Category": [
      "Material Category", "Customer Category", "Vendor Category",
      "Purchase Indent Category", "Sales Indent Category", "PO Category",
      "Sales RFQ Category", "Sales Order Category", "Goods Receipt Category",
      "Goods Issue Category", "Billing Category", "Invoice Category",
      "Purchase Quotation Category", "Purchase Contract Category", "Sale Contract Category", "Transfer Category"
    ],
    "Purchase": [
      "Purchase Indent", "Purchase Quotation", "Purchase Contract", "Purchase Order",
      "Purchase Indent List", "Purchase Quotations List", "Purchase Contract List", "Purchase Order List"
    ],
    "Sales": [
      "Sales Indent", "Sales Quotation Form", "Sales Contract", "Sales Order", "Sales Delivery",
      "Sales Indent List", "Sales Quotations List", "Sales Contract List", "Sales Order List", "Sales Delivery List"
    ],
    "Inventory": [
      "Material Receipt", "Material Receipt List", "Material Issue",
      "Material Transfer", "Material Issue List", "Stock List"
    ],
    "Invoice": ["Invoice Form", "Invoice List",],
    "Billing": ["Billing Form", "Billing List","Diea Invoice","Diea Company"],
    "Accounts": ["GST", "Ledger", "Payments"],
    "CRM": [
      "Contacts List", "Leads", "Proposals", "Sources",
      "Lost Reason", "Contact Stage", "Industry", "Calls"
    ],
    "Project Management": [  // Add this new section
      "Projects", "Tasks", "Milestones", "Time Entries"
    ],
    "Campaigns": [  // Add this new section
      "Campaigns", "Analytics"
    ],
    "HRMS": [
      "Designation",
      "Department",
      "Employee",
      "LeaveRequests",
      "LeaveRequestManagement",
      "Payroll",
      "AttendanceRegister",
      "AttendanceReports",
      "AttendanceTaking"

    ]

  };



  const structuredPermissions = [];

  // Go through each main permission category
  for (const [mainPerm, subPerms] of Object.entries(permissionsStructure)) {
    // Check if this main permission is included
    if (permissions.includes(mainPerm)) {
      // Find all selected sub-permissions for this main permission
      const selectedSubPerms = subPerms.filter(subPerm =>
        permissions.includes(subPerm)
      );

      // Add to structured permissions
      structuredPermissions.push({
        name: mainPerm,
        subPermissions: selectedSubPerms
      });
    }
  }

  return structuredPermissions;
}

// Helper to structure permissions

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

// Get next role ID
exports.getNextRoleId = async (req, res) => {
  try {
    const roleCount = await Role.countDocuments();
    const nextId = `R${(roleCount + 1).toString().padStart(2, '0')}`;
    res.json({ nextId });
  } catch (error) {
    console.error("Error getting next role ID:", error);
    res.status(500).json({ error: "Failed to get next role ID" });
  }
};

// Create role
exports.createRole = async (req, res) => {
  try {
    const { roleName, permissions } = req.body;

    // Get the count of existing roles to generate next ID
    const roleCount = await Role.countDocuments();
    const roleId = `R${(roleCount + 1).toString().padStart(2, '0')}`;

    const structuredPermissions = organizePermissions(permissions);
    const role = new Role({ roleId, roleName, permissions, structuredPermissions });
    await role.save();

    res.status(201).json(role);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Failed to create role" });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { roleId, roleName, permissions } = req.body;
    const structuredPermissions = organizePermissions(permissions);

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { roleId, roleName, permissions, structuredPermissions },
      { new: true }
    );

    if (!updatedRole) return res.status(404).json({ error: "Role not found" });
    res.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const result = await Role.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Failed to delete role" });
  }
};

// Check for duplicate role name
exports.checkRoleName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Role name is required" });

    const existingRole = await Role.findOne({
      roleName: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    res.json({ exists: !!existingRole });
  } catch (error) {
    console.error("Error checking role name:", error);
    res.status(500).json({ message: "Server error" });
  }
};
