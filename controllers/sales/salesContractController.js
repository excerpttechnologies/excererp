const SalesContract = require('../../models/sales/SalesContractModel');
const SaleContractCategory = require('../../models/categories/SaleContractCategoryModel');
const Customer = require('../../models/masterdata/Customer'); // Assuming you have a Customer model

async function generateContractNumber(categoryId) {
  const category = await SaleContractCategory.findById(categoryId);
  if (!category) throw new Error('Contract category not found');


  const lastContract = await SalesContract.find({ categoryId, contractNumberType: 'internal' })
    .sort({ contractNumber: -1 })
    .limit(1);

  let nextNumber = category.rangeFrom;
  console.log('lastContract:', lastContract);
  if (lastContract.length > 0) {
    const lastNumber = parseInt(lastContract[0].contractNumber);
    nextNumber = lastNumber + 1;
  }

  if (nextNumber > category.rangeTo) {
    throw new Error('Contract number exceeded category range.');
  }

  return   nextNumber.toString().padStart(6, '0');
}

// Create Contract
exports.createContract = async (req, res) => {
  try {
    let contractNumber;
    
    // Check if external contract number is provided
    if (req.body.contractNumberType === 'external' && req.body.externalContractNumber) {
      // Check if external contract number already exists
      const existingContract = await SalesContract.findOne({ 
        contractNumber: req.body.externalContractNumber.trim() 
      });
      
      if (existingContract) {
        return res.status(400).json({ error: 'Contract number already exists' });
      }
      
      contractNumber = req.body.externalContractNumber.trim();
    } else {
      // Generate internal contract number
      contractNumber = await generateContractNumber(req.body.categoryId);
    }

    // ✅ fetch customer data using ID from frontend
    const customer = await Customer.findById(req.body.customerId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // ✅ use name1 + name2 and trim extra spaces
    const customerName = `${customer.name1} ${customer.name2}`.trim();
    
    // Validate validity date range
    if (req.body.validityFromDate && req.body.validityToDate) {
      const fromDate = new Date(req.body.validityFromDate);
      const toDate = new Date(req.body.validityToDate);
      
      if (fromDate > toDate) {
        return res.status(400).json({ 
          error: 'Validity From date cannot be later than Validity To date' 
        });
      }
    }

    console.log('req body for sales contract:', req.body);
    
    // ✅ create contract with customerName field included
    const newContract = new SalesContract({
      ...req.body,
      contractNumber,
      customerName // this field exists in SalesContract schema
    });

    const saved = await newContract.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating contract:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all contracts
exports.getAllContracts = async (req, res) => {
  const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
  try {
    const contracts = await SalesContract.find(filter)
      .populate('categoryId customerId')
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(contracts);
  } catch (err) {
    console.error('Error fetching contracts:', err);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
};

// Get contract by ID
exports.getContractById = async (req, res) => {
  try {
    const contract = await SalesContract.findById(req.params.id)
      .populate('categoryId customerId');
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (err) {
    console.error('Error fetching contract:', err);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
};

// Update contract
exports.updateContract = async (req, res) => {
  try {
    // If customer is being updated, fetch new customer name
    if (req.body.customerId) {
      const customer = await Customer.findById(req.body.customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      req.body.customerName = `${customer.name1} ${customer.name2}`.trim();
    }

    // Validate validity date range if being updated
    if (req.body.validityFromDate && req.body.validityToDate) {
      const fromDate = new Date(req.body.validityFromDate);
      const toDate = new Date(req.body.validityToDate);
      
      if (fromDate > toDate) {
        return res.status(400).json({ 
          error: 'Validity From date cannot be later than Validity To date' 
        });
      }
    }

    const updated = await SalesContract.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('categoryId customerId');

    if (!updated) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating contract:', err);
    res.status(500).json({ error: 'Failed to update contract', details: err.message });
  }
};

// Delete contract
exports.deleteContract = async (req, res) => {
  try {
    const deleted = await SalesContract.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json({ message: 'Contract deleted successfully', deletedContract: deleted });
  } catch (err) {
    console.error('Error deleting contract:', err);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
};

// Get contracts by customer
exports.getContractsByCustomer = async (req, res) => {
  try {
    const contracts = await SalesContract.find({ customerId: req.params.customerId })
      .populate('categoryId customerId')
      .sort({ createdAt: -1 });
    
    res.json(contracts);
  } catch (err) {
    console.error('Error fetching customer contracts:', err);
    res.status(500).json({ error: 'Failed to fetch customer contracts' });
  }
};

// Get contracts by date range
exports.getContractsByDateRange = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    let query = {};
    
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }
    
    const contracts = await SalesContract.find(query)
      .populate('categoryId customerId')
      .sort({ createdAt: -1 });
    
    res.json(contracts);
  } catch (err) {
    console.error('Error fetching contracts by date range:', err);
    res.status(500).json({ error: 'Failed to fetch contracts by date range' });
  }
};

// Get contract statistics
exports.getContractStats = async (req, res) => {
  try {
    const totalContracts = await SalesContract.countDocuments();
    const activeContracts = await SalesContract.countDocuments({
      validityToDate: { $gte: new Date().toISOString().split('T')[0] }
    });
    const expiredContracts = await SalesContract.countDocuments({
      validityToDate: { $lt: new Date().toISOString().split('T')[0] }
    });
    
    res.json({
      totalContracts,
      activeContracts,
      expiredContracts,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error fetching contract statistics:', err);
    res.status(500).json({ error: 'Failed to fetch contract statistics' });
  }
};