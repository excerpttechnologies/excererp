const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserCompany = require('../models/UserCompany');
const Role = require('../models/Roles');
const jwt = require('jsonwebtoken');
const JWT_SECRET='secret'
const mongoose = require('mongoose');
const Employee=require('../models/hrms/employee')
// exports.createUser = async (req, res) => {
//   try {
//     const { username, email, password, companies, phone, address, roles } = req.body;
//     console.log('Creating user with data:', req.body);
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, email, password: hashedPassword, phone, address, roles });
//     await user.save();

//     for (const  companyId of companies) {
//       const userCompany = new UserCompany({
//         userId: user._id,
//         companyId,
//         role: item.role
//       });
//       await userCompany.save();
//     }

//     res.status(201).json({ message: 'User created and assigned to companies' });
//   } catch (err) {
//     res.status(500).json({ error: 'Error creating user' });
//   }
// };

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, companies, phone, address, roles } = req.body;
    console.log('Creating user with data:', req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, phone, address, roles });
    await user.save();
    console.log('User saved:', user._id);

    for (const companyId of companies) {
      const userCompany = new UserCompany({
        userId: user._id,
        companyId
      });

      await userCompany.save();
      console.log(`Assigned company: ${companyId}`);
    }

    res.status(201).json({ message: 'User created and assigned to companies' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Error creating user' });
  }
};

// exports.loginUser = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;
// console.log('Login attempt with identifier:', identifier,  password);
//     // Check if identifier is email or phone
//     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
//     const query = isEmail ? { email: identifier } : { phone: identifier };

//     const user = await User.findOne(query);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

//     // Fetch user companies
//     const userCompanies = await UserCompany.find({ userId: user._id }).populate('companyId');

//     // Collect all role ObjectIds from both user.roles and company.roles
//     const globalRoleIds = user.roles || [];
//     const companyRoleIds = userCompanies.flatMap(uc => uc.roles || []);
//     const allRoleIds = [...new Set([...globalRoleIds, ...companyRoleIds.map(r => r.toString())])];

//     // Fetch all roles once
//     const roles = await Role.find({ _id: { $in: allRoleIds } });
//     const rolesMap = {};
//     roles.forEach(role => {
//       rolesMap[role._id.toString()] = role.roleName;
//     });
//  const userData = {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//       phone: user.phone,
//       address: user.address,
      
//       roles: globalRoleIds.map(roleId => ({
//         roleId,
//         roleName: rolesMap[roleId.toString()] || 'Unknown'
//       })),
//       companies: userCompanies.map(uc => ({
//         companyId: uc.companyId._id,
//         companyName: uc.companyId.name
//       }))
//     };

//     const token = jwt.sign({ user: userData }, JWT_SECRET, { expiresIn: '1d' });

//     // Respond
//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         address: user.address,
//         roles: globalRoleIds.map(roleId => ({
//           roleId,
//           roleName: rolesMap[roleId.toString()] || 'Unknown'
//         })),
//         companies: userCompanies.map(uc => ({
//           companyId: uc.companyId._id,
//           companyName: uc.companyId.name,
         
//         }))
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Login failed' });
//   }
// };

// exports.loginUser = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;
//     console.log('Login attempt with identifier:', identifier, password);

//     // Check if identifier is email or phone
//     const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
//     const query = isEmail ? { email: identifier } : { phone: identifier };

//     // Try finding in User schema
//     let user = await User.findOne(query);
//     let isEmployee = false;
//     let userCompanies = [];
//     let globalRoleIds = [];

//     // If not found in User, try Employee schema
//     if (!user) {
//       user = await Employee.findOne(query);
//       if (!user) return res.status(404).json({ error: 'User not found' });
//       isEmployee = true;
//     }

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });


//       // Fetch companies & roles only for User schema
//       userCompanies = await UserCompany.find({ userId: user._id }).populate('companyId');
//       globalRoleIds = user.roles || [];
    

//     // Collect all role ObjectIds
//     const companyRoleIds = userCompanies.flatMap(uc => uc.roles || []);
//     const allRoleIds = [...new Set([...globalRoleIds, ...companyRoleIds.map(r => r.toString())])];

//     // Fetch role names
//     const roles = await Role.find({ _id: { $in: allRoleIds } });
//     const rolesMap = {};
//     roles.forEach(role => {
//       rolesMap[role._id.toString()] = role.roleName;
//     });

//      let displayName;
//     if (isEmployee) {
//       displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
//     } else {
//       displayName = user.username || '';
//     }
//     // Prepare user data
//     const userData = {
//       id: user._id,
//       username: displayName,
//       email: user.email,
//       phone: user.phone,
//       address: user.address,
//       employeeId:user.employeeId,
//       roles: globalRoleIds.map(roleId => ({
//         roleId,
//         roleName: rolesMap[roleId.toString()] || 'Unknown'
//       })),
//       companies: userCompanies.map(uc => ({
//         companyId: uc.companyId._id,
//         companyName: uc.companyId.name
//       }))
//     };
// console.log("userdata",userData)
//     // Generate token
//     const token = jwt.sign({ user: userData }, JWT_SECRET, { expiresIn: '1d' });

//     // Response
//     res.json({
//       message: 'Login successful',
//       token,
//       user: userData,
//       isEmployee
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Login failed' });
//   }
// };

exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log('Login attempt with identifier:', identifier, password);

    // Check if identifier is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmail ? { email: identifier } : { phone: identifier };

    // Try finding in User schema
    let user = await User.findOne(query);
    let isEmployee = false;
    let userCompanies = [];
    let globalRoleIds = [];

    // If not found in User, try Employee schema
    if (!user) {
      user = await Employee.findOne(query);
      if (!user) return res.status(404).json({ error: 'User not found' });
      isEmployee = true;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Handle roles and companies based on user type
    if (isEmployee) {
      // For employees - handle their roles differently
      globalRoleIds = user.roles || [];
      
      // If employee has a companyId, create a simple company entry without fetching
      if (user.companyId) {
        userCompanies = [{
          companyId: { _id: user.companyId, name: 'Employee Company' },
          roles: []
        }];
      }
    } else {
      // For regular users - existing logic
      userCompanies = await UserCompany.find({ userId: user._id }).populate('companyId');
      globalRoleIds = user.roles || [];
    }

    // Collect all role ObjectIds
    const companyRoleIds = userCompanies.flatMap(uc => uc.roles || []);
    const allRoleIds = [...new Set([...globalRoleIds, ...companyRoleIds.map(r => r.toString())])];
    console.log('All role IDs to search:', allRoleIds); // Debug log

    // Fetch role names only if we have valid ObjectIds
    let rolesMap = {};
    if (allRoleIds.length > 0 && allRoleIds.some(id => mongoose.Types.ObjectId.isValid(id))) {
      const validRoleIds = allRoleIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      const roles = await Role.find({ _id: { $in: validRoleIds } });
      roles.forEach(role => {
        rolesMap[role._id.toString()] = role.roleName;
      });
    }

    let displayName;
    if (isEmployee) {
      displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    } else {
      displayName = user.username || '';
    }

    // Prepare user data
    const userData = {
      id: user._id,
      username: displayName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      employeeId: user.employeeId,
      roles: globalRoleIds
        .filter(roleId => mongoose.Types.ObjectId.isValid(roleId))
        .map(roleId => ({
          roleId,
          roleName: rolesMap[roleId.toString()] || 'Unknown'
        })),
      companies: userCompanies.map(uc => ({
        companyId: uc.companyId._id,
        companyName: uc.companyId.name
      }))
    };

    console.log("userdata", userData);

    // Generate token
    const token = jwt.sign({ user: userData }, JWT_SECRET, { expiresIn: '1d' });

    // Response
    res.json({
      message: 'Login successful',
      token,
      user: userData,
      isEmployee
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.getUserCompanies = async (req, res) => {
  const userId = req.params.id;
  console.log('Fetching companies for user ID:', userId);
  const userCompanies = await UserCompany.find({ userId }).populate('companyId');

  const companies = userCompanies.map((uc) => ({
    _id: uc.companyId._id,
    name: uc.companyId.name,
    role: uc.role,
  }));
  console.log('Companies for user:', companies);
    res.json(companies);
};
