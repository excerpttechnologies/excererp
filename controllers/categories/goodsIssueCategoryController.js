const GoodsIssueCategory = require('../../models/categories/GoodsIssueCategory');

// @desc    Create new goods issue category
// @route   POST /api/goodsissuecategory
// @access  Public
const createGoodsIssueCategory = async (req, res) => {
  try {
    const { categoryName,companyId, rangeStart, rangeEnd } = req.body;

    if (!categoryName || rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const category = new GoodsIssueCategory({ categoryName, companyId, rangeStart, rangeEnd });
    await category.save();

    res.status(201).json({ message: 'Goods Issue Category created successfully', category });
  } catch (error) {
    console.error('Error creating goods issue category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all goods issue categories
// @route   GET /api/goodsissuecategory
const getAllGoodsIssueCategories = async (req, res) => {
  try {
    const { companyId} = req.query;

    const filter = {};
     if (companyId) filter.companyId = companyId;
    const categories = await GoodsIssueCategory.find(filter);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Update a goods issue category
// @route   PUT /api/goodsissuecategory/:id
const updateGoodsIssueCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

    const updated = await GoodsIssueCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, prefix, rangeStart, rangeEnd },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully', category: updated });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

module.exports = {
  createGoodsIssueCategory,
  getAllGoodsIssueCategories,
  updateGoodsIssueCategory
};
