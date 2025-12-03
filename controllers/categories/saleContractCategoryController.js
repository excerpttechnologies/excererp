const SaleContractCategory = require('../../models/categories/SaleContractCategoryModel');

// Create
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new SaleContractCategory(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contract category', details: err });
  }
};

// Get All
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await SaleContractCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contract categories' });
  }
};

// Update
exports.updateCategory = async (req, res) => {
  try {
    const updated = await SaleContractCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Contract category not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update contract category', details: err });
  }
};

// Get by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await SaleContractCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Contract category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contract category', details: err });
  }
};

// Delete
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await SaleContractCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Contract category not found' });
    }
    res.json({ message: 'Contract category deleted successfully', deletedCategory: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete contract category', details: err });
  }
};

// Get active categories only
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await SaleContractCategory.find({ isActive: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active contract categories' });
  }
};