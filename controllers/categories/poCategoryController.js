const POCategory = require('../../models/categories/POCategory');

// Create PO Category
exports.createCategory = async (req, res) => {
  try {
    const { categoryName,  rangeFrom, rangeTo, companyId } = req.body;
    console.log("po", req.body)
    const newCategory = new POCategory({ categoryName,rangeFrom, rangeTo, companyId });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create PO category' });
  }
};

// Get All PO Categories
exports.getAllCategories = async (req, res) => {
  try {
     const { companyId} = req.query;

    const filter = {};
     if (companyId) filter.companyId = companyId;
    const categories = await POCategory.find(filter);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PO categories' });
  }
};

// Update PO Category
exports.updateCategory = async (req, res) => {
  try {
    const updated = await POCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update PO category' });
  }
};
