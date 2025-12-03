const PurchaseContractCategory = require('../../models/categories/PurchaseContractCategoryModel');

// Create
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new PurchaseContractCategory(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create purchase contract category', details: err.message });
  }
};

// Get All
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await PurchaseContractCategory.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase contract categories' });
  }
};

// Update
exports.updateCategory = async (req, res) => {
  try {
    const updated = await PurchaseContractCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Purchase contract category not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update purchase contract category', details: err.message });
  }
};

// Get by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await PurchaseContractCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Purchase contract category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase contract category', details: err.message });
  }
};

// Delete
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await PurchaseContractCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Purchase contract category not found' });
    }
    res.json({ message: 'Purchase contract category deleted successfully', deletedCategory: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete purchase contract category', details: err.message });
  }
};

// Get active categories only
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await PurchaseContractCategory.find({ isActive: true }).sort({ categoryName: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active purchase contract categories' });
  }
};

// Get categories by prefix
exports.getCategoriesByPrefix = async (req, res) => {
  try {
    const { prefix } = req.params;
    const categories = await PurchaseContractCategory.find({ 
      prefix: prefix.toUpperCase(),
      isActive: true 
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories by prefix' });
  }
};

// Check if range overlaps with existing categories
exports.checkRangeAvailability = async (req, res) => {
  try {
    const { rangeFrom, rangeTo, excludeId } = req.body;
    
    let query = {
      $or: [
        { rangeFrom: { $lte: rangeTo }, rangeTo: { $gte: rangeFrom } }
      ]
    };
    
    // Exclude current category if updating
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const overlapping = await PurchaseContractCategory.find(query);
    
    res.json({
      available: overlapping.length === 0,
      overlapping: overlapping
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check range availability' });
  }
};