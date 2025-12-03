const Contract = require('../../models/purchase/Contract')
const ContractCategory = require('../../models/categories/PurchaseContractCategoryModel');

// Generate Contract Number
async function generateCTNRNumber(categoryId) {
  try {
    const category = await ContractCategory.findById(categoryId);
    if (!category) throw new Error('Contract Category not found');
    
    console.log('Category range:', category.rangeFrom, 'to', category.rangeTo);
    
    // Find ALL contracts for this category to determine the highest number
    const existingContracts = await Contract.find({ 
      contractCategoryId: categoryId, contractNumberType: 'internal'
    }).select('contractNumber');
    
    let nextNumber = category.rangeFrom;
    
    if (existingContracts.length > 0) {
      console.log('Found existing contracts:', existingContracts.length);
      
      // Extract all numbers and find the maximum
      const usedNumbers = existingContracts
        .map(contract => {
          // Don't strip prefix - parse the full number part
          const numberPart = contract.contractNumber.replace(category.prefix, '');
          return parseInt(numberPart, 10);
        })
        .filter(num => !isNaN(num) && num >= category.rangeFrom && num <= category.rangeTo); // Filter valid numbers within range
      
      if (usedNumbers.length > 0) {
        const maxUsedNumber = Math.max(...usedNumbers);
        console.log('Highest used number:', maxUsedNumber);
        nextNumber = maxUsedNumber + 1;
      }
    }
    
    console.log('Next number to use:', nextNumber);
    
    if (nextNumber > category.rangeTo) {
      throw new Error(`Contract number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
    }
    
    const generatedContractNumber = `${nextNumber}`;
    console.log('Generated Contract Number:', generatedContractNumber);
    
    // Optional: Add a check to ensure this number doesn't already exist
    const existingContract = await Contract.findOne({ 
      contractNumber: `${category.prefix}${generatedContractNumber}` 
    });
    if (existingContract) {
      throw new Error(`Contract number ${category.prefix}${generatedContractNumber} already exists`);
    }
    
    return generatedContractNumber;
  } catch (error) {
    console.error('Error in generateCTNRNumber:', error);
    throw error;
  }
}

// Create Contract
exports.createContract = async (req, res) => {
    try {
        const { contractGenType, externalContractNumber, ...otherData } = req.body;
        const contractCategoryId = req.body.categoryId;
        // console.log('Received data:', req.body);
        let contractNumber;

        if (contractGenType === 'external') {
            if (!externalContractNumber || externalContractNumber.trim() === '') {
                return res.status(400).json({ error: 'External contract number is required' });
            }

            const existingContract = await Contract.findOne({
                contractNumber: externalContractNumber.trim()
            });

            if (existingContract) {
                return res.status(400).json({ error: 'Contract number already exists' });
            }

            contractNumber = externalContractNumber.trim();
        } else {
            contractNumber = await generateCTNRNumber(contractCategoryId);
        }

        const contract = new Contract({
            contractNumber,
            contractCategoryId,
            contractGenType: contractGenType || 'internal',
            ...otherData
        });
// console.log('Contract data:', contract);
        await contract.save();
        res.status(201).json({
            message: 'Contract created successfully',
            contract,
            generationType: contractGenType
        });
    } catch (error) {
        console.error('Error creating contract:', error);

        if (error.code === 11000) {
            return res.status(400).json({ error: 'Contract number already exists' });
        }

        res.status(500).json({ error: 'Failed to create contract' });
    }
};

// Get All Contracts
exports.getAllContracts = async (req, res) => {
    try {
        const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;

        const contracts = await Contract.find(filter)

        res.json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ error: 'Failed to fetch contracts' });
    }
};

// Get Contract by ID
exports.getContractById = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id).populate('contractCategoryId', 'categoryName prefix');
        if (!contract) return res.status(404).json({ message: 'Contract not found' });
        res.json(contract);
    } catch (error) {
        console.error('Error fetching contract:', error);
        res.status(500).json({ message: 'Failed to fetch contract' });
    }
};

// Update Contract
exports.updateContractById = async (req, res) => {
    try {
        const {
            indentId,
            categoryId,
            contractCategoryId,
            vendor,
            vendorName,
            contractReference,
            cnNo,
            validityFDate,
            validityTDate,
            note,
            location,
            buyerGroup,
            totalPrice,
            items
        } = req.body;

        const calculatedTotalPrice = totalPrice || items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) || 0);
        }, 0);

        const updatedContract = await Contract.findByIdAndUpdate(
            req.params.id,
            {
                indentId,
                categoryId,
                contractCategoryId,
                vendor,
                vendorName,
                contractReference,
                cnNo,
                validityFDate,
                validityTDate,
                note,
                location,
                buyerGroup,
                totalPrice: calculatedTotalPrice,
                items
            },
            { new: true }
        );

        if (!updatedContract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        res.json(updatedContract);
    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
