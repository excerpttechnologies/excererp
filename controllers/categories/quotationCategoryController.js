const QuotationCategory = require('../../models/categories/QuotationCategory');

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, companyId, rangeFrom, rangeTo } = req.body;
    console.log(req.body)
    const newCategory = new QuotationCategory(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to create RFQ category' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await QuotationCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch RFQ categories' });
  }
};
exports.updateCategory = async (req, res) => {
    try {
      const updated = await QuotationCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  };
  
