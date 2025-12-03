const SalesOrderCategory = require('../../models/categories/SalesOrderCategory');

exports.createCategory = async (req, res) => {
  try {
    const newCat = new SalesOrderCategory(req.body);
    await newCat.save();
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { companyId} = req.query;

    const filter = {};
     if (companyId) filter.companyId = companyId;
    const categories = await SalesOrderCategory.find(filter);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updated = await SalesOrderCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};
