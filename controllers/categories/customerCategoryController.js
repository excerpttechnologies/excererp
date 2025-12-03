const CustomerCategory = require('../../models/categories/CustomerCategory');

// Create
exports.createCustomerCategory = async (req, res) => {
  try {
    const { categoryName,  rangeFrom, rangeTo,companyId } = req.body;

    const newCategory = new CustomerCategory({
      categoryName,
      rangeFrom,
      rangeTo,
      companyId
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all
exports.getAllCustomerCategories = async (req, res) => {
  try {
     const { companyId} = req.query;

    const filter = {};
     if (companyId) filter.companyId = companyId;
    const categories = await CustomerCategory.find(filter);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
exports.getCustomerCategoryById = async (req, res) => {
  try {
    const category = await CustomerCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updateCustomerCategory = async (req, res) => {
  try {
    const updated = await CustomerCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
exports.deleteCustomerCategory = async (req, res) => {
  try {
    await CustomerCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
