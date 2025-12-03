// const PurchaseOrder = require('../../models/purchase/PurchaseOrder');
// const POCategory = require('../../models/categories/POCategory');
// const Quotation = require('../../models/purchase/Quotation');

// async function generatePONumber(categoryId) {
//   try {
//     const category = await POCategory.findById(categoryId);
//     if (!category) throw new Error('PO Category not found');
    

//     console.log('Category range:', category.rangeFrom, 'to', category.rangeTo);
    
//     // Find ALL POs for this category to determine the highest number
//     const existingPOs = await PurchaseOrder.find({ 
//       categoryId,
//     }).select('poNumber');
    
//     let nextNumber = category.rangeFrom;
    
//     if (existingPOs.length > 0) {
//       console.log('Found existing POs:', existingPOs.length);
      
//       // Extract all numbers and find the maximum
//       const usedNumbers = existingPOs
//         .map(po => {
//           const numberPart = po.poNumber;
//           return parseInt(numberPart, 10);
//         })
//         .filter(num => !isNaN(num)); // Filter out invalid numbers
      
//       if (usedNumbers.length > 0) {
//         const maxUsedNumber = Math.max(...usedNumbers);
//         console.log('Highest used number:', maxUsedNumber);
//         nextNumber = maxUsedNumber + 1;
//       }
//     }
    
//     console.log('Next number to use:', nextNumber);
    
//     if (nextNumber > category.rangeTo) {
//       throw new Error(`PO number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
//     }
    
//     const generatedPONumber = `${nextNumber.toString().padStart(6, '0')}`;
//     console.log('Generated PO Number:', generatedPONumber);
    
//     // Optional: Add a check to ensure this number doesn't already exist
//     const existingPO = await PurchaseOrder.findOne({ poNumber: generatedPONumber });
//     if (existingPO) {
//       throw new Error(`PO number ${generatedPONumber} already exists`);
//     }
    
//     return generatedPONumber;
//   } catch (error) {
//     console.error('Error in generatePONumber:', error);
//     throw error;
//   }
// }


// // Alternative approach: Use a counter field in the category
// async function generatePONumberWithCounter(categoryId) {
//   try {
//     const category = await POCategory.findById(categoryId);
//     if (!category) throw new Error('PO Category not found');
    
//     // Initialize counter if it doesn't exist
//     if (!category.currentCounter) {
//       category.currentCounter = category.rangeFrom;
//     }
    
//     const nextNumber = category.currentCounter;
    
//     if (nextNumber > category.rangeTo) {
//       throw new Error(`PO number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
//     }
    
//     // Increment counter for next use
//     category.currentCounter = nextNumber + 1;
//     await category.save();
    
//     const generatedPONumber = `${category.prefix}-${nextNumber.toString().padStart(6, '0')}`;
//     console.log('Generated PO Number:', generatedPONumber);
    
//     return generatedPONumber;
//   } catch (error) {
//     console.error('Error in generatePONumberWithCounter:', error);
//     throw error;
//   }
// }

// // Updated createPO function with better error handling
// exports.createPO = async (req, res) => {
//   try {
//     const {
//       quotationNumber,
//       categoryId,
//       category,
//       date,
//       deliveryLocation,
//       deliveryAddress,
//       taxName,
//       cgst,
//       sgst,
//       igst,
//       notes,
//       remarks,
//       preparedby,
//       approvedby,
//       processes,
//       items,
//       generalConditions,
//       taxDiscount,
//       finalTotal,
//       companyId,
//       financialYear,
//       vendor,
//       poGenerationType,
//       poNumber: externalPONumber
//     } = req.body;

//     console.log("Purchase order request:", req.body);

//     // ✅ Step 1: Find quotation by quotationNumber
//     // const quotation = await Quotation.findOne({ quotationNumber });
//     // if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

//     // ✅ Step 2: Generate or use PO number based on type
//     let poNumber;

//     if (poGenerationType === 'external') {
//       // Use external PO number
//       if (!externalPONumber) {
//         return res.status(400).json({ error: 'External PO number is required' });
//       }
      
//       poNumber = externalPONumber;

//       // Check if external PO number already exists
//       const existingPO = await PurchaseOrder.findOne({ poNumber });
//       if (existingPO) {
//         return res.status(400).json({ error: 'PO number already exists' });
//       }
//     } else {
//       // Generate internal PO number
//       if (!categoryId) {
//         return res.status(400).json({ error: 'Category ID is required for internal PO generation' });
//       }
      
//       try {
//         poNumber = await generatePONumber(categoryId);
//         console.log('Generated PO Number:', poNumber);
//       } catch (error) {
//         console.error('Error generating PO number:', error);
//         return res.status(500).json({ error: `Failed to generate PO number: ${error.message}` });
//       }
//     }



//     const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

//     // ✅ Step 4: Save PO with additional fields
//     const newPO = new PurchaseOrder({
//       poNumber,
//       categoryId,
//       category,
//       date,
//       vendor,
//       notes,
//       deliveryLocation: deliveryLocation  || '',
//       deliveryAddress,
//       // quotationId: quotation._id,
//       quotationNumber,
//       items,
//       total,
//       processes,
//       generalConditions,
//       remarks,
//       preparedby,
//       approvedby,
//       taxName,
//       cgst,
//       sgst,
//       igst,
//       taxDiscount,
//       finalTotal,
//       financialYear,
//       companyId,
//       poGenerationType
//     });

//     const saved = await newPO.save();
//     console.log('PO saved successfully:', saved.poNumber);
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error('Error creating PO:', err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get All Purchase Orders
// exports.getAllPOs = async (req, res) => {
//   try {
//      const { companyId } = req.query;

//     const filter = {};
//     if (companyId) filter.companyId = companyId;
//     if (financialYear) filter.financialYear = financialYear;

  
//     const pos = await PurchaseOrder.find(filter).populate('categoryId quotationId companyId');
//     res.status(200).json(pos);
//     console.log("pos",pos)
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch purchase orders' });
//   }
// };

// // Optional: Get Single PO by ID
// exports.getPOById = async (req, res) => {
//   try {
//     const po = await PurchaseOrder.findById(req.params.id).populate('categoryId quotationId');
//     if (!po) return res.status(404).json({ message: 'PO not found' });
//     res.json(po);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch PO' });
//   }
// };



const PurchaseOrder = require('../../models/purchase/PurchaseOrder');
const POCategory = require('../../models/categories/POCategory');
const Quotation = require('../../models/purchase/Quotation');

async function generatePONumber(categoryId) {
  try {
    const category = await POCategory.findById(categoryId);
    if (!category) throw new Error('PO Category not found');
    

    console.log('Category range:', category.rangeFrom, 'to', category.rangeTo);
    
    // Find ALL POs for this category to determine the highest number
    const existingPOs = await PurchaseOrder.find({ 
      categoryId
    }).select('poNumber');
    
    let nextNumber = category.rangeFrom;
    
    if (existingPOs.length > 0) {
      console.log('Found existing POs:', existingPOs.length);
      
      // Extract all numbers and find the maximum
      const usedNumbers = existingPOs
        .map(po => {
          const numberPart = po.poNumber;
          return parseInt(numberPart, 10);
        })
        .filter(num => !isNaN(num)); // Filter out invalid numbers
      
      if (usedNumbers.length > 0) {
        const maxUsedNumber = Math.max(...usedNumbers);
        console.log('Highest used number:', maxUsedNumber);
        nextNumber = maxUsedNumber + 1;
      }
    }
    
    console.log('Next number to use:', nextNumber);
    
    if (nextNumber > category.rangeTo) {
      throw new Error(`PO number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
    }
    
    const generatedPONumber = `${nextNumber.toString().padStart(6, '0')}`;
    console.log('Generated PO Number:', generatedPONumber);
    
    // Optional: Add a check to ensure this number doesn't already exist
    const existingPO = await PurchaseOrder.findOne({ poNumber: generatedPONumber });
    if (existingPO) {
      throw new Error(`PO number ${generatedPONumber} already exists`);
    }
    
    return generatedPONumber;
  } catch (error) {
    console.error('Error in generatePONumber:', error);
    throw error;
  }
}

// Alternative approach: Use a counter field in the category
async function generatePONumberWithCounter(categoryId) {
  try {
    const category = await POCategory.findById(categoryId);
    if (!category) throw new Error('PO Category not found');
    
    // Initialize counter if it doesn't exist
    if (!category.currentCounter) {
      category.currentCounter = category.rangeFrom;
    }
    
    const nextNumber = category.currentCounter;
    
    if (nextNumber > category.rangeTo) {
      throw new Error(`PO number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
    }
    
    // Increment counter for next use
    category.currentCounter = nextNumber + 1;
    await category.save();
    
    const generatedPONumber = `${category.prefix}-${nextNumber.toString().padStart(6, '0')}`;
    console.log('Generated PO Number:', generatedPONumber);
    
    return generatedPONumber;
  } catch (error) {
    console.error('Error in generatePONumberWithCounter:', error);
    throw error;
  }
}

// Create Purchase Order
exports.createPO = async (req, res) => {
  try {
    const {
      quotationNumber,
      categoryId,
      category,
      date,
      deliveryLocation,
      deliveryAddress,
      taxName,
      cgst,
      sgst,
      igst,
      notes,
      remarks,
      preparedby,
      approvedby,
      processes,
      items,
      generalConditions,
      taxDiscount,
      finalTotal,
      companyId,
      financialYear,
      vendor,
      poGenerationType,
      poNumber: externalPONumber
    } = req.body;

    console.log("Purchase order request:", req.body);

    // Generate or use PO number based on type
    let poNumber;

    if (poGenerationType === 'external') {
      // Use external PO number
      if (!externalPONumber) {
        return res.status(400).json({ error: 'External PO number is required' });
      }
      
      poNumber = externalPONumber;

      // Check if external PO number already exists
      // const existingPO = await PurchaseOrder.findOne({ poNumber });
      // if (existingPO) {
      //   return res.status(400).json({ error: 'PO number already exists' });
      // }
    } else {
      // Generate internal PO number
      if (!categoryId) {
        return res.status(400).json({ error: 'Category ID is required for internal PO generation' });
      }
      
      try {
        poNumber = await generatePONumber(categoryId);
        console.log('Generated PO Number:', poNumber);
      } catch (error) {
        console.error('Error generating PO number:', error);
        return res.status(500).json({ error: `Failed to generate PO number: ${error.message}` });
      }
    }

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Save PO with additional fields
    const newPO = new PurchaseOrder({
      poNumber,
      categoryId,
      category,
      date,
      vendor,
      notes,
      deliveryLocation: deliveryLocation || '',
      deliveryAddress,
      quotationNumber,
      items,
      total,
      processes,
      generalConditions,
      remarks,
      preparedby,
      approvedby,
      taxName,
      cgst,
      sgst,
      igst,
      taxDiscount,
      finalTotal,
      financialYear,
      companyId,
      poGenerationType,
      status: 'draft', // Set initial status
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const saved = await newPO.save();
    console.log('PO saved successfully:', saved.poNumber);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating PO:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Purchase Orders
exports.getAllPOs = async (req, res) => {
  try {
    const { companyId } = req.query;
    console.log("asdas",companyId)
    const filter = {};
    if (companyId) filter.companyId = companyId;


    const pos = await PurchaseOrder.find(filter)
      .populate('categoryId quotationId companyId')
      .sort({ createdAt: -1 }); // Sort by newest first
       console.log("pos", pos.length, "records found");
    res.status(200).json(pos);
   
  } catch (err) {
    console.error('Error fetching POs:', err);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

// Get Single PO by ID
exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('categoryId quotationId companyId');
    
    if (!po) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }
    
    res.status(200).json(po);
  } catch (err) {
    console.error('Error fetching PO by ID:', err);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
};

// Update Purchase Order
exports.updatePO = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // If items are being updated, recalculate total
    if (updateData.items && Array.isArray(updateData.items)) {
      const total = updateData.items.reduce((sum, item) => {
        return sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0));
      }, 0);
      
      updateData.total = total;

      // Recalculate final total with taxes
      const cgst = parseFloat(updateData.cgst) || 0;
      const sgst = parseFloat(updateData.sgst) || 0;
      const igst = parseFloat(updateData.igst) || 0;
      const taxDiscount = parseFloat(updateData.taxDiscount) || 0;

      const cgstAmount = (total * cgst) / 100;
      const sgstAmount = (total * sgst) / 100;
      const igstAmount = (total * igst) / 100;

      updateData.finalTotal = total + cgstAmount + sgstAmount + igstAmount - taxDiscount;
    }

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).populate('categoryId quotationId companyId');

    if (!updatedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO updated successfully:', updatedPO.poNumber);
    res.status(200).json(updatedPO);
  } catch (err) {
    console.error('Error updating PO:', err);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
};

// Approve Purchase Order
exports.approvePO = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      approvedBy, 
      approvalDate, 
      approvalComments,
      status = 'approved'
    } = req.body;

    // Validate required fields
    if (!approvedBy || !approvalDate) {
      return res.status(400).json({ 
        error: 'Approved by and approval date are required' 
      });
    }

    const updateData = {
      status,
      approvedBy,
      approvalDate,
      approvalComments: approvalComments || '',
      updatedAt: new Date()
    };

    const approvedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('categoryId quotationId companyId');

    if (!approvedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO approved successfully:', approvedPO.poNumber, 'by', approvedBy);
    res.status(200).json({
      message: 'Purchase Order approved successfully',
      purchaseOrder: approvedPO
    });
  } catch (err) {
    console.error('Error approving PO:', err);
    res.status(500).json({ error: 'Failed to approve purchase order' });
  }
};

// Reject Purchase Order
exports.rejectPO = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      rejectedBy, 
      rejectionDate, 
      rejectionComments,
      rejectionReason
    } = req.body;

    // Validate required fields
    if (!rejectedBy || !rejectionDate) {
      return res.status(400).json({ 
        error: 'Rejected by and rejection date are required' 
      });
    }

    const updateData = {
      status: 'rejected',
      rejectedBy,
      rejectionDate,
      rejectionComments: rejectionComments || '',
      rejectionReason: rejectionReason || '',
      updatedAt: new Date()
    };

    const rejectedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('categoryId quotationId companyId');

    if (!rejectedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO rejected:', rejectedPO.poNumber, 'by', rejectedBy);
    res.status(200).json({
      message: 'Purchase Order rejected',
      purchaseOrder: rejectedPO
    });
  } catch (err) {
    console.error('Error rejecting PO:', err);
    res.status(500).json({ error: 'Failed to reject purchase order' });
  }
};

// Delete Purchase Order
exports.deletePO = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPO = await PurchaseOrder.findByIdAndDelete(id);

    if (!deletedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO deleted successfully:', deletedPO.poNumber);
    res.status(200).json({ 
      message: 'Purchase Order deleted successfully',
      deletedPO: {
        id: deletedPO._id,
        poNumber: deletedPO.poNumber
      }
    });
  } catch (err) {
    console.error('Error deleting PO:', err);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
};

// Get Purchase Orders by Status
exports.getPOsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { companyId } = req.query;

    const filter = { status };
    if (companyId) filter.companyId = companyId;

    const pos = await PurchaseOrder.find(filter)
      .populate('categoryId quotationId companyId')
      .sort({ updatedAt: -1 });

    res.status(200).json(pos);
  } catch (err) {
    console.error('Error fetching POs by status:', err);
    res.status(500).json({ error: 'Failed to fetch purchase orders by status' });
  }
};

// Get Purchase Order Statistics
exports.getPOStats = async (req, res) => {
  try {
    const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

    const stats = await PurchaseOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$finalTotal' }
        }
      }
    ]);

    const totalPOs = await PurchaseOrder.countDocuments(filter);

    res.status(200).json({
      totalPurchaseOrders: totalPOs,
      statusBreakdown: stats,
      summary: stats.reduce((acc, stat) => {
        acc[stat._id || 'draft'] = {
          count: stat.count,
          totalValue: stat.totalValue || 0
        };
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('Error fetching PO stats:', err);
    res.status(500).json({ error: 'Failed to fetch purchase order statistics' });
  }
};

// Search Purchase Orders
exports.searchPOs = async (req, res) => {
  try {
    const { query, searchBy = 'poNumber', companyId, financialYear } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

    // Add search criteria based on searchBy parameter
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
    
    switch (searchBy) {
      case 'poNumber':
        filter.poNumber = searchRegex;
        break;
      case 'vendor':
        filter.vendor = searchRegex;
        break;
      case 'category':
        filter.category = searchRegex;
        break;
      case 'quotationNumber':
        filter.quotationNumber = searchRegex;
        break;
      default:
        // Search across multiple fields
        filter.$or = [
          { poNumber: searchRegex },
          { vendor: searchRegex },
          { category: searchRegex },
          { quotationNumber: searchRegex },
          { deliveryLocation: searchRegex }
        ];
    }

    const pos = await PurchaseOrder.find(filter)
      .populate('categoryId quotationId companyId')
      .sort({ updatedAt: -1 })
      .limit(50); // Limit results for performance

    res.status(200).json(pos);
  } catch (err) {
    console.error('Error searching POs:', err);
    res.status(500).json({ error: 'Failed to search purchase orders' });
  }
};

exports.updatePO = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // If items are being updated, recalculate total
    if (updateData.items && Array.isArray(updateData.items)) {
      const total = updateData.items.reduce((sum, item) => {
        return sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0));
      }, 0);
      
      updateData.total = total;

      // Recalculate final total with taxes
      const cgst = parseFloat(updateData.cgst) || 0;
      const sgst = parseFloat(updateData.sgst) || 0;
      const igst = parseFloat(updateData.igst) || 0;
      const taxDiscount = parseFloat(updateData.taxDiscount) || 0;

      const cgstAmount = (total * cgst) / 100;
      const sgstAmount = (total * sgst) / 100;
      const igstAmount = (total * igst) / 100;

      updateData.finalTotal = total + cgstAmount + sgstAmount + igstAmount - taxDiscount;
    }

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    ).populate('categoryId quotationId companyId');

    if (!updatedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO updated successfully:', updatedPO.poNumber);
    res.status(200).json(updatedPO);
  } catch (err) {
    console.error('Error updating PO:', err);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
};

// Approve Purchase Order
exports.approvePO = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      approvedBy, 
      approvalDate, 
      approvalComments,
      status = 'approved'
    } = req.body;

    // Validate required fields
    if (!approvedBy || !approvalDate) {
      return res.status(400).json({ 
        error: 'Approved by and approval date are required' 
      });
    }

    const updateData = {
      status,
      approvedBy,
      approvalDate,
      approvalComments: approvalComments || '',
      updatedAt: new Date()
    };

    const approvedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('categoryId quotationId companyId');

    if (!approvedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO approved successfully:', approvedPO.poNumber, 'by', approvedBy);
    res.status(200).json({
      message: 'Purchase Order approved successfully',
      purchaseOrder: approvedPO
    });
  } catch (err) {
    console.error('Error approving PO:', err);
    res.status(500).json({ error: 'Failed to approve purchase order' });
  }
};

// Reject Purchase Order
exports.rejectPO = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      rejectedBy, 
      rejectionDate, 
      rejectionComments,
      rejectionReason
    } = req.body;

    // Validate required fields
    if (!rejectedBy || !rejectionDate) {
      return res.status(400).json({ 
        error: 'Rejected by and rejection date are required' 
      });
    }

    const updateData = {
      status: 'rejected',
      rejectedBy,
      rejectionDate,
      rejectionComments: rejectionComments || '',
      rejectionReason: rejectionReason || '',
      updatedAt: new Date()
    };

    const rejectedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('categoryId quotationId companyId');

    if (!rejectedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO rejected:', rejectedPO.poNumber, 'by', rejectedBy);
    res.status(200).json({
      message: 'Purchase Order rejected',
      purchaseOrder: rejectedPO
    });
  } catch (err) {
    console.error('Error rejecting PO:', err);
    res.status(500).json({ error: 'Failed to reject purchase order' });
  }
};

// Delete Purchase Order
exports.deletePO = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPO = await PurchaseOrder.findByIdAndDelete(id);

    if (!deletedPO) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    console.log('PO deleted successfully:', deletedPO.poNumber);
    res.status(200).json({ 
      message: 'Purchase Order deleted successfully',
      deletedPO: {
        id: deletedPO._id,
        poNumber: deletedPO.poNumber
      }
    });
  } catch (err) {
    console.error('Error deleting PO:', err);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
};

// Get Purchase Orders by Status
exports.getPOsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { companyId } = req.query;

    const filter = { status };
    if (companyId) filter.companyId = companyId;
   
    const pos = await PurchaseOrder.find(filter)
      .populate('categoryId quotationId companyId')
      .sort({ updatedAt: -1 });

    res.status(200).json(pos);
  } catch (err) {
    console.error('Error fetching POs by status:', err);
    res.status(500).json({ error: 'Failed to fetch purchase orders by status' });
  }
};

// Search Purchase Orders
exports.searchPOs = async (req, res) => {
  try {
    const { query, searchBy = 'poNumber', companyId, financialYear } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

    // Add search criteria based on searchBy parameter
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
    
    switch (searchBy) {
      case 'poNumber':
        filter.poNumber = searchRegex;
        break;
      case 'vendor':
        filter.vendor = searchRegex;
        break;
      case 'category':
        filter.category = searchRegex;
        break;
      case 'quotationNumber':
        filter.quotationNumber = searchRegex;
        break;
      default:
        // Search across multiple fields
        filter.$or = [
          { poNumber: searchRegex },
          { vendor: searchRegex },
          { category: searchRegex },
          { quotationNumber: searchRegex },
          { deliveryLocation: searchRegex }
        ];
    }

    const pos = await PurchaseOrder.find(filter)
      .populate('categoryId quotationId companyId')
      .sort({ updatedAt: -1 })
      .limit(50); // Limit results for performance

    res.status(200).json(pos);
  } catch (err) {
    console.error('Error searching POs:', err);
    res.status(500).json({ error: 'Failed to search purchase orders' });
  }
};

// Get Purchase Order Statistics
exports.getPOStats = async (req, res) => {
  try {
    const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

    const stats = await PurchaseOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$finalTotal' }
        }
      }
    ]);

    const totalPOs = await PurchaseOrder.countDocuments(filter);

    res.status(200).json({
      totalPurchaseOrders: totalPOs,
      statusBreakdown: stats,
      summary: stats.reduce((acc, stat) => {
        acc[stat._id || 'draft'] = {
          count: stat.count,
          totalValue: stat.totalValue || 0
        };
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('Error fetching PO stats:', err);
    res.status(500).json({ error: 'Failed to fetch purchase order statistics' });
  }
};