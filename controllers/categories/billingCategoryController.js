// const BillingCategory = require('../../models/categories/BillingCategory');

// // @desc    Create new billing category
// const createBillingCategory = async (req, res) => {
//   try {
//     const { categoryName,  rangeStart, rangeEnd } = req.body;
//     if (!categoryName ||  rangeStart === undefined || rangeEnd === undefined) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     const category = new BillingCategory(req.body);
//     await category.save();
//     res.status(201).json({ message: 'Billing Category created successfully', category });
//   } catch (error) {
//     console.error('Error creating billing category:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // @desc    Get all billing categories
// const getAllBillingCategories = async (req, res) => {
//   try {
//     const categories = await BillingCategory.find();
//     res.json(categories);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch categories' });
//   }
// };

// // @desc    Update a billing category
// const updateBillingCategory = async (req, res) => {
//   try {
//     const { categoryName, prefix, rangeStart, rangeEnd } = req.body;
//     const updated = await BillingCategory.findByIdAndUpdate(
//       req.params.id,
//       { categoryName, prefix, rangeStart, rangeEnd },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ error: 'Category not found' });

//     res.json({ message: 'Category updated successfully', category: updated });
//   } catch (err) {
//     console.error('Error updating billing category:', err);
//     res.status(500).json({ error: 'Failed to update category' });
//   }
// };

// module.exports = {
//   createBillingCategory,
//   getAllBillingCategories,
//   updateBillingCategory
// };


const BillingCategory = require('../../models/categories/BillingCategory');

// @desc    Create new billing category
const createBillingCategory = async (req, res) => {
  try {
    const {
      categoryName,
      prefix,
      financialYearStart,
      financialYearEnd,
      rangeStart,
      rangeEnd,
      companyId,
    } = req.body;

    // Validation
    if (
      !categoryName ||
      !financialYearStart ||
      !financialYearEnd ||
      !rangeStart ||
      !rangeEnd ||
      !companyId
    ) {
      return res.status(400).json({
        error:
          'Category name, financial year start/end, range start, range end, and company ID are required',
      });
    }

    // Convert dates
    const fyStartDate = new Date(financialYearStart);
    const fyEndDate = new Date(financialYearEnd);

    // Check for overlapping ranges in same company & financial year
    const existingCategory = await BillingCategory.findOne({
      companyId,
      financialYearStart: { $lte: fyEndDate },
      financialYearEnd: { $gte: fyStartDate },
      $or: [
        {
          rangeStart: { $lte: parseInt(rangeEnd) },
          rangeEnd: { $gte: parseInt(rangeStart) },
        },
      ],
    });

    if (existingCategory) {
      return res.status(400).json({
        error: `Range overlaps with existing category "${existingCategory.categoryName}" in the given financial year`,
      });
    }

    if (parseInt(rangeStart) >= parseInt(rangeEnd)) {
      return res
        .status(400)
        .json({ error: 'Range start must be less than range end' });
    }

    const category = new BillingCategory({
      categoryName,
      prefix: prefix || '',
      financialYearStart: fyStartDate,
      financialYearEnd: fyEndDate,
      rangeStart: parseInt(rangeStart),
      rangeEnd: parseInt(rangeEnd),
      companyId,
      currentSequence: parseInt(rangeStart),
    });

    await category.save();

    res
      .status(201)
      .json({ message: 'Billing Category created successfully', category });
  } catch (error) {
    console.error('Error creating billing category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// @desc    Get all billing categories
const getAllBillingCategories = async (req, res) => {
  try {
    const { companyId, financialYear } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const filter = { companyId };
    if (financialYear) filter.financialYear = financialYear;

    const categories = await BillingCategory.find(filter).sort({ financialYear: -1, rangeStart: 1 });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching billing categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Update a billing category
const updateBillingCategory = async (req, res) => {
  try {
    const { categoryName, financialYear, prefix, rangeStart, rangeEnd, companyId } = req.body;

    if (!categoryName || !financialYear || rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check for overlapping ranges excluding current category
    const existingCategory = await BillingCategory.findOne({
      _id: { $ne: req.params.id },
      companyId,
      financialYear,
      $or: [
        { rangeStart: { $lte: rangeEnd }, rangeEnd: { $gte: rangeStart } }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({ 
        error: `Range overlaps with existing category "${existingCategory.categoryName}" in ${financialYear}` 
      });
    }

    if (parseInt(rangeStart) >= parseInt(rangeEnd)) {
      return res.status(400).json({ error: 'Range start must be less than range end' });
    }

    const updated = await BillingCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, financialYear, prefix: prefix || '', rangeStart: parseInt(rangeStart), rangeEnd: parseInt(rangeEnd), companyId },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Category not found' });

    res.json({ message: 'Category updated successfully', category: updated });
  } catch (err) {
    console.error('Error updating billing category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// @desc    Generate next billing number for a category
// @route   POST /api/billingcategory/:id/generate-number
const generateBillingNumber = async (req, res) => {
  try {
    const category = await BillingCategory.findById(req.params.id);

    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (category.currentSequence > category.rangeEnd) {
      return res.status(400).json({ error: `Billing range exhausted for category ${category.categoryName} in ${category.financialYear}` });
    }

    const billingNumber = `${category.prefix}${category.financialYear}/${category.currentSequence.toString().padStart(4, '0')}`;

    // Increment sequence
    category.currentSequence += 1;
    await category.save();

    res.json({ billingNumber, sequence: category.currentSequence, remaining: category.rangeEnd - category.currentSequence });
  } catch (err) {
    console.error('Error generating billing number:', err);
    res.status(500).json({ error: 'Failed to generate billing number' });
  }
};

module.exports = {
  createBillingCategory,
  getAllBillingCategories,
  updateBillingCategory,
  generateBillingNumber
};
