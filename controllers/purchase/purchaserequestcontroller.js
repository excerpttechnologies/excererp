const Purchasecategory=require('../../models/purchase/purchaserequestmodel')

// @desc    Create new category
// @route   POST /api/category
// @access  Public
const createCategory = async (req, res) => {
  try { 
    const { categoryName,  rangeStart, rangeEnd } = req.body;

    if (!categoryName ||  rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const category = new Purchasecategory({ categoryName, rangeStart, rangeEnd });
    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Purchasecategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

    const updated = await Purchasecategory.findByIdAndUpdate(
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
  createCategory,
 getAllCategories, updateCategory
};
