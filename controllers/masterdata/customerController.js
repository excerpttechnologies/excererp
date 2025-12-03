const Customer = require('../../models/masterdata/Customer');
const CustomerCategory = require('../../models/categories/CustomerCategory');

// // Generate next CNNo based on category
// async function generateCNNo(categoryId) {
//   const category = await CustomerCategory.findById(categoryId);
//   const count = await Customer.countDocuments({ categoryId });

//   const nextNum = category.rangeFrom + count;
//   return `${category.prefix}${nextNum.toString().padStart(3, '0')}`;
// }

// // Create Customer
// exports.createCustomer = async (req, res) => {
//   try {
//     const cnNo = await generateCNNo(req.body.categoryId);

//     const newCustomer = new Customer({
//       ...req.body,
//       cnNo
//     });

//     await newCustomer.save();
//     res.status(201).json(newCustomer);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

async function generateCNNo(categoryId) {
  const category = await CustomerCategory.findById(categoryId);
  const count = await Customer.countDocuments({ categoryId });

  const nextNum = category.rangeFrom + count;
  return nextNum.toString().padStart(3, '0');
}

// Check if external customer ID already exists
async function checkExternalCustomerIdExists(externalCustomerId) {
  const existingCustomer = await Customer.findOne({ 
    externalCustomerId: externalCustomerId,
    customerType: 'external'
  });
  return existingCustomer !== null;
}

// Create Customer
exports.createCustomer = async (req, res) => {
  try {
    const { customerType, externalCustomerId, categoryId, ...otherData } = req.body;
    
    let cnNo;
    console.log("cutsromer",req.body)
    // Validate customer type
    if (!customerType || !['internal', 'external'].includes(customerType)) {
      return res.status(400).json({ 
        error: 'Customer type is required and must be either "internal" or "external"' 
      });
    }
    
    // Handle external customer
    if (customerType === 'external') {
      if (!externalCustomerId || !externalCustomerId.trim()) {
        return res.status(400).json({ 
          error: 'External Customer ID is required for external customers' 
        });
      }
      
      if (externalCustomerId.length > 50) {
        return res.status(400).json({ 
          error: 'External Customer ID cannot exceed 50 characters' 
        });
      }
      
      // Check if external customer ID already exists
      const exists = await checkExternalCustomerIdExists(externalCustomerId.trim());
      if (exists) {
        return res.status(400).json({ 
          error: 'External Customer ID already exists. Please use a different ID.' 
        });
      }
      
      // For external customers, use the provided external ID as cnNo
      cnNo = externalCustomerId.trim();
    } else {
      // For internal customers, generate cnNo automatically
      if (!categoryId) {
        return res.status(400).json({ 
          error: 'Category is required for internal customers' 
        });
      }
      cnNo = await generateCNNo(categoryId);
    }
    
    const newCustomer = new Customer({
      ...otherData,
      categoryId: categoryId || null,
      cnNo: cnNo,
      customerType: customerType,
      externalCustomerId: customerType === 'external' ? externalCustomerId.trim() : null
    });
    
    await newCustomer.save();
    
    // Populate category information before sending response
    await newCustomer.populate('categoryId');
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
};
// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    const customers = await Customer.find(filter).populate('categoryId');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Customer
exports.updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.updateCustomerStatus = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body, // e.g., { isDeleted: true }
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ error: error.message });
  }
};

