const SalesDelivery = require('../../models/sales/SalesDelivery');
const SalesOrderCategory = require('../../models/categories/SalesOrderCategory');
const SalesOrder = require('../../models/sales/SalesOrder');

// Generate Delivery Number
async function generateDeliveryNumber(categoryId) {
  try {
    const category = await SalesOrderCategory.findById(categoryId);
    if (!category) throw new Error('Delivery Category not found');

    console.log('Category range:', category.rangeFrom, 'to', category.rangeTo);

    // Find all existing Sales Deliveries for this category
    const existingDeliveries = await SalesDelivery.find({
      categoryId, deliveryNumberType: 'internal'
    }).select('deliveryNumber');

    let nextNumber = category.rangeFrom;

    if (existingDeliveries.length > 0) {
      console.log('Found existing Deliveries:', existingDeliveries.length);

      const usedNumbers = existingDeliveries
        .map(delivery => parseInt(delivery.deliveryNumber, 10))
        .filter(num => !isNaN(num));

      if (usedNumbers.length > 0) {
        const maxUsedNumber = Math.max(...usedNumbers);
        console.log('Highest used delivery number:', maxUsedNumber);
        nextNumber = maxUsedNumber + 1;
      }
    }

    console.log('Next delivery number to use:', nextNumber);

    if (nextNumber > category.rangeTo) {
      throw new Error(
        `Delivery number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`
      );
    }

    const generatedDeliveryNumber = `${nextNumber
      .toString()
      .padStart(6, '0')}`;
    console.log('Generated Delivery Number:', generatedDeliveryNumber);

    // Double-check uniqueness
    const existingDelivery = await SalesDelivery.findOne({ 
      deliveryNumber: generatedDeliveryNumber, 
      categoryId 
    });
    if (existingDelivery) {
      throw new Error(`Delivery number ${generatedDeliveryNumber} already exists`);
    }

    return generatedDeliveryNumber;
  } catch (error) {
    console.error('Error in generateDeliveryNumber:', error);
    throw error;
  }
}

// Generate Delivery Number Route Handler
exports.generateDeliveryNumber = async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const deliveryNumber = await generateDeliveryNumber(categoryId);
    res.json({ deliveryNumber });
  } catch (error) {
    console.error('Error generating delivery number:', error);
    res.status(500).json({ error: error.message || 'Failed to generate delivery number' });
  }
};

// Create Sales Delivery
exports.createSalesDelivery = async (req, res) => {
  try {
    const { categoryId, deliveryNumberType, customDeliveryNumber, salesOrderId } = req.body;
    
    let deliveryNumber;
    
    if (deliveryNumberType === 'external' && customDeliveryNumber) {
      // Check if external delivery number already exists
      const existingDelivery = await SalesDelivery.findOne({ 
        deliveryNumber: customDeliveryNumber 
      });
      if (existingDelivery) {
        return res.status(400).json({ error: 'Delivery number already exists' });
      }
      deliveryNumber = customDeliveryNumber;
    } else {
      // Generate internal delivery number
      deliveryNumber = await generateDeliveryNumber(categoryId);
    }

    console.log('req for sales delivery:', req.body);
    
    // Validate that the sales order exists
    if (salesOrderId) {
      const salesOrder = await SalesOrder.findById(salesOrderId);
      if (!salesOrder) {
        return res.status(400).json({ error: 'Referenced Sales Order not found' });
      }
    }

    const salesDelivery = new SalesDelivery({ 
      ...req.body, 
      deliveryNumber,
      deliveryNumberType: deliveryNumberType || 'internal'
    });
    
    const saved = await salesDelivery.save();
    
    // Populate the saved delivery with sales order details
    const populatedDelivery = await SalesDelivery.findById(saved._id)
      .populate('salesOrderId', 'soNumber customerName')
      .populate('categoryId', 'categoryName');
    
    res.status(201).json(populatedDelivery);
  } catch (error) {
    console.error('Error creating sales delivery:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create sales delivery' 
    });
  }
};

// Get All Sales Deliveries
exports.getAllSalesDeliveries = async (req, res) => {
  const { companyId } = req.query;
  
  if (!companyId ) {
    return res.status(400).json({ 
      error: 'companyId and financialYear are required' 
    });
  }
  
  console.log('Fetching sales deliveries for:', companyId);
  
  try {
    const deliveries = await SalesDelivery.find({ 
      companyId
    })
    .populate('salesOrderId', 'soNumber customerName')
    .populate('categoryId', 'categoryName')
    .sort({ createdAt: -1 });
    
    res.json(deliveries);
  } catch (err) {
    console.error('Error fetching sales deliveries:', err);
    res.status(500).json({ error: 'Failed to fetch sales deliveries' });
  }
};

// Get Sales Delivery by ID
exports.getSalesDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await SalesDelivery.findById(id)
      .populate('salesOrderId', 'soNumber customerName items')
      .populate('categoryId', 'categoryName');
    
    if (!delivery) {
      return res.status(404).json({ error: 'Sales delivery not found' });
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Error fetching sales delivery:', error);
    res.status(500).json({ error: 'Failed to fetch sales delivery' });
  }
};

// Update Sales Delivery
exports.updateSalesDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent updating delivery number directly
    delete updates.deliveryNumber;
    delete updates.deliveryNumberType;
    
    const delivery = await SalesDelivery.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    )
    .populate('salesOrderId', 'soNumber customerName')
    .populate('categoryId', 'categoryName');
    
    if (!delivery) {
      return res.status(404).json({ error: 'Sales delivery not found' });
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Error updating sales delivery:', error);
    res.status(500).json({ error: 'Failed to update sales delivery' });
  }
};

// Delete Sales Delivery
exports.deleteSalesDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    
    const delivery = await SalesDelivery.findByIdAndDelete(id);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Sales delivery not found' });
    }
    
    res.json({ message: 'Sales delivery deleted successfully', delivery });
  } catch (error) {
    console.error('Error deleting sales delivery:', error);
    res.status(500).json({ error: 'Failed to delete sales delivery' });
  }
};

// Get Deliveries by Sales Order
exports.getDeliveriesBySalesOrder = async (req, res) => {
  try {
    const { salesOrderId } = req.params;
    const { companyId } = req.query;
    
    const deliveries = await SalesDelivery.find({ 
      salesOrderId,
      companyId,
      financialYear
    })
    .populate('categoryId', 'categoryName')
    .sort({ createdAt: -1 });
    
    res.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries by sales order:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};

// Update Delivery Status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus, actualDeliveryDate } = req.body;
    
    const validStatuses = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({ 
        error: 'Invalid delivery status. Must be one of: ' + validStatuses.join(', ') 
      });
    }
    
    const updateData = { deliveryStatus };
    if (actualDeliveryDate) {
      updateData.actualDeliveryDate = actualDeliveryDate;
    }
    
    const delivery = await SalesDelivery.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('salesOrderId', 'soNumber customerName')
    .populate('categoryId', 'categoryName');
    
    if (!delivery) {
      return res.status(404).json({ error: 'Sales delivery not found' });
    }
    
    res.json(delivery);
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
};

// Get Delivery Statistics
exports.getDeliveryStatistics = async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId || !financialYear) {
      return res.status(400).json({ 
        error: 'companyId and financialYear are required' 
      });
    }
    
    const stats = await SalesDelivery.aggregate([
      {
        $match: { companyId: companyId, financialYear: financialYear }
      },
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);
    
    const totalDeliveries = await SalesDelivery.countDocuments({ 
      companyId, 
      financialYear 
    });
    
    const totalAmount = await SalesDelivery.aggregate([
      {
        $match: { companyId: companyId, financialYear: financialYear }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);
    
    res.json({
      totalDeliveries,
      totalAmount: totalAmount[0]?.total || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Error fetching delivery statistics:', error);
    res.status(500).json({ error: 'Failed to fetch delivery statistics' });
  }
};