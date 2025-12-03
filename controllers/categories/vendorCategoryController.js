const VendorCategory = require('../../models/categories/VendorCategory');

// Create
exports.createVendorCategory = async (req, res) => {
  try {
    const { categoryName,  rangeFrom, rangeTo, companyId } = req.body;

    const newCategory = new VendorCategory({
      categoryName,
      
      rangeFrom,
      rangeTo,
      companyId
    });
console.log("vencat",req.body)
    await newCategory.save();
    console.log("savevencat",newCategory)
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all
exports.getAllVendorCategories = async (req, res) => {
  try {
     const { companyId} = req.query;
console.log("vendorid",req.query)
    const filter = {};
     if (companyId) filter.companyId = companyId;
    const categories = await VendorCategory.find(filter);
    res.json(categories);
    console.log("vendr",categories)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
exports.getVendorCategoryById = async (req, res) => {
  try {
    const category = await VendorCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updateVendorCategory = async (req, res) => {
  try {
    const updated = await VendorCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
exports.deleteVendorCategory = async (req, res) => {
  try {
    await VendorCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
