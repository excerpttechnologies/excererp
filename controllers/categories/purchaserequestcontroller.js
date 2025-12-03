const Purchasecategory=require('../../models/purchaserequestmodel')

// @desc    Create new category
// @route   POST /api/category
// @access  Public
const createCategory = async (req, res) => {
  try {
    const { categoryName, rangeStart, rangeEnd, companyId } = req.body;
console.log("pure",req.body)
    if (!categoryName || rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const category = new Purchasecategory(req.body);
    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllCategories = async (req, res) => {
  try {
     const { companyId} = req.query;

    const filter = {};
     if (companyId) filter.companyId = companyId;
    const categories = await Purchasecategory.find(filter);
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
