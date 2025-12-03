// // const InvoiceCategory = require('../../models/categories/InvoiceCategory');

// // // @desc    Create new invoice category
// // // @route   POST /api/invoicecategory
// // // @access  Public
// // const createInvoiceCategory = async (req, res) => {
// //   try {
// //     const { categoryName, rangeStart, rangeEnd } = req.body;

// //     if (!categoryName || rangeStart === undefined || rangeEnd === undefined) {
// //       return res.status(400).json({ error: 'All fields are required' });
// //     }

// //     const category = new InvoiceCategory(req.body);
// //     await category.save();

// //     res.status(201).json({ message: 'Invoice Category created successfully', category });
// //   } catch (error) {
// //     console.error('Error creating invoice category:', error);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // };

// // // @desc    Get all invoice categories
// // // @route   GET /api/invoicecategory
// // const getAllInvoiceCategories = async (req, res) => {
// //   try {
// //     const { companyId } = req.query;

// //     const categories = await InvoiceCategory.find({ companyId });
// //     res.json(categories);
// //   } catch (err) {
// //     res.status(500).json({ error: 'Failed to fetch categories' });
// //   }
// // };

// // // @desc    Update an invoice category
// // // @route   PUT /api/invoicecategory/:id
// // const updateInvoiceCategory = async (req, res) => {
// //   try {
// //     const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

// //     const updated = await InvoiceCategory.findByIdAndUpdate(
// //       req.params.id,
// //       { categoryName, prefix, rangeStart, rangeEnd },
// //       { new: true }
// //     );

// //     if (!updated) {
// //       return res.status(404).json({ error: 'Category not found' });
// //     }

// //     res.json({ message: 'Category updated successfully', category: updated });
// //   } catch (err) {
// //     console.error('Error updating category:', err);
// //     res.status(500).json({ error: 'Failed to update category' });
// //   }
// // };

// // module.exports = {
// //   createInvoiceCategory,
// //   getAllInvoiceCategories,
// //   updateInvoiceCategory
// // };



// const InvoiceCategory = require('../../models/categories/InvoiceCategory');

// // @desc    Create new invoice category
// // @route   POST /api/invoicecategory
// // @access  Public
// const createInvoiceCategory = async (req, res) => {
//   try {
//     const { categoryName, financialYear, rangeStart, rangeEnd, prefix, companyId } = req.body;

//     // Validation
//     if (!categoryName || !financialYear || rangeStart === undefined || rangeEnd === undefined || !companyId) {
//       return res.status(400).json({ error: 'Category name, financial year, range start, range end, and company ID are required' });
//     }

//     // Check for overlapping ranges in the same financial year and company
//     const existingCategory = await InvoiceCategory.findOne({
//       companyId,
//       financialYear,
//       $or: [
//         {
//           rangeStart: { $lte: rangeEnd },
//           rangeEnd: { $gte: rangeStart }
//         }
//       ]
//     });

//     if (existingCategory) {
//       return res.status(400).json({ 
//         error: `Range overlaps with existing category "${existingCategory.categoryName}" in ${financialYear}` 
//       });
//     }

//     // Validate range
//     if (parseInt(rangeStart) >= parseInt(rangeEnd)) {
//       return res.status(400).json({ error: 'Range start must be less than range end' });
//     }

//     const category = new InvoiceCategory({
//       categoryName,
//       financialYear,
//       rangeStart: parseInt(rangeStart),
//       rangeEnd: parseInt(rangeEnd),
//       prefix: prefix || '',
//       companyId,
//       currentSequence: parseInt(rangeStart) // Track current sequence for invoice generation
//     });

//     await category.save();

//     res.status(201).json({ 
//       message: 'Invoice Category created successfully', 
//       category 
//     });
//   } catch (error) {
//     console.error('Error creating invoice category:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // @desc    Get all invoice categories
// // @route   GET /api/invoicecategory
// const getAllInvoiceCategories = async (req, res) => {
//   try {
//     const { companyId, financialYear } = req.query;
//     console.log('Fetching invoice categories for:', { companyId, financialYear });
//     if (!companyId) {
//       return res.status(400).json({ error: 'Company ID is required' });
//     }

//     const filter = { companyId };

//     // Filter by financial year if provided
//     if (financialYear) {
//       filter.financialYear = financialYear;
//     }

//     const categories = await InvoiceCategory.find(filter)
//       .sort({ financialYear: -1, rangeStart: 1 }); // Sort by latest financial year first, then by range start

//     res.json(categories);
//   } catch (err) {
//     console.error('Error fetching categories:', err);
//     res.status(500).json({ error: 'Failed to fetch categories' });
//   }
// };

// // @desc    Update an invoice category
// // @route   PUT /api/invoicecategory/:id
// const updateInvoiceCategory = async (req, res) => {
//   try {
//     const { categoryName, financialYear, prefix, rangeStart, rangeEnd, companyId } = req.body;

//     if (!categoryName || !financialYear || rangeStart === undefined || rangeEnd === undefined) {
//       return res.status(400).json({ error: 'All required fields must be provided' });
//     }

//     // Check for overlapping ranges (excluding current category)
//     const existingCategory = await InvoiceCategory.findOne({
//       _id: { $ne: req.params.id },
//       companyId,
//       financialYear,
//       $or: [
//         {
//           rangeStart: { $lte: rangeEnd },
//           rangeEnd: { $gte: rangeStart }
//         }
//       ]
//     });

//     if (existingCategory) {
//       return res.status(400).json({ 
//         error: `Range overlaps with existing category "${existingCategory.categoryName}" in ${financialYear}` 
//       });
//     }

//     // Validate range
//     if (parseInt(rangeStart) >= parseInt(rangeEnd)) {
//       return res.status(400).json({ error: 'Range start must be less than range end' });
//     }

//     const updated = await InvoiceCategory.findByIdAndUpdate(
//       req.params.id,
//       { 
//         categoryName, 
//         financialYear,
//         prefix: prefix || '', 
//         rangeStart: parseInt(rangeStart), 
//         rangeEnd: parseInt(rangeEnd),
//         companyId 
//       },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     res.json({ message: 'Category updated successfully', category: updated });
//   } catch (err) {
//     console.error('Error updating category:', err);
//     res.status(500).json({ error: 'Failed to update category' });
//   }
// };

// // @desc    Delete an invoice category
// // @route   DELETE /api/invoicecategory/:id
// const deleteInvoiceCategory = async (req, res) => {
//   try {
//     const deleted = await InvoiceCategory.findByIdAndDelete(req.params.id);

//     if (!deleted) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     res.json({ message: 'Category deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting category:', err);
//     res.status(500).json({ error: 'Failed to delete category' });
//   }
// };

// // @desc    Generate next invoice number for a category
// // @route   POST /api/invoicecategory/:id/generate-number
// const generateInvoiceNumber = async (req, res) => {
//   try {
//     const category = await InvoiceCategory.findById(req.params.id);

//     if (!category) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     // Check if we've reached the end of the range
//     if (category.currentSequence > category.rangeEnd) {
//       return res.status(400).json({ 
//         error: `Invoice range exhausted for category ${category.categoryName} in ${category.financialYear}` 
//       });
//     }

//     const invoiceNumber = `${category.prefix}${category.financialYear}/${category.currentSequence.toString().padStart(4, '0')}`;

//     // Increment the current sequence
//     await InvoiceCategory.findByIdAndUpdate(
//       req.params.id,
//       { $inc: { currentSequence: 1 } }
//     );

//     res.json({ 
//       invoiceNumber,
//       sequence: category.currentSequence,
//       remaining: category.rangeEnd - category.currentSequence
//     });
//   } catch (err) {
//     console.error('Error generating invoice number:', err);
//     res.status(500).json({ error: 'Failed to generate invoice number' });
//   }
// };

// // @desc    Get categories for current financial year
// // @route   GET /api/invoicecategory/current-year
// const getCurrentYearCategories = async (req, res) => {
//   try {
//     const { companyId } = req.query;

//     if (!companyId) {
//       return res.status(400).json({ error: 'Company ID is required' });
//     }

//     // Determine current financial year (April to March)
//     const now = new Date();
//     const currentYear = now.getFullYear();
//     const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

//     let financialYearStart, financialYearEnd;
//     if (currentMonth >= 4) { // April onwards
//       financialYearStart = currentYear;
//       financialYearEnd = currentYear + 1;
//     } else { // January to March
//       financialYearStart = currentYear - 1;
//       financialYearEnd = currentYear;
//     }

//     const financialYear = `${financialYearStart.toString().slice(-2)}-${financialYearEnd.toString().slice(-2)}`;

//     const categories = await InvoiceCategory.find({ 
//       companyId, 
//       financialYear 
//     }).sort({ rangeStart: 1 });

//     res.json({ 
//       financialYear,
//       categories 
//     });
//   } catch (err) {
//     console.error('Error fetching current year categories:', err);
//     res.status(500).json({ error: 'Failed to fetch current year categories' });
//   }
// };

// module.exports = {
//   createInvoiceCategory,
//   getAllInvoiceCategories,
//   updateInvoiceCategory,
//   deleteInvoiceCategory,
//   generateInvoiceNumber,
//   getCurrentYearCategories
// };


const InvoiceCategory = require('../../models/categories/InvoiceCategory');

// @desc    Create new invoice category
// @route   POST /api/invoicecategory
// @access  Public
const createInvoiceCategory = async (req, res) => {
  try {
    const { categoryName, financialYearStart, financialYearEnd, rangeStart, rangeEnd, prefix, companyId } = req.body;

    if (!categoryName || !financialYearStart || !financialYearEnd || rangeStart === undefined || rangeEnd === undefined || !companyId) {
      return res.status(400).json({ error: 'All required fields are mandatory' });
    }

    // Check for overlapping ranges
    const existingCategory = await InvoiceCategory.findOne({
      companyId,
      financialYearStart: new Date(financialYearStart),
      financialYearEnd: new Date(financialYearEnd),
      $or: [
        {
          rangeStart: { $lte: parseInt(rangeEnd) },
          rangeEnd: { $gte: parseInt(rangeStart) }
        }
      ]
    });


    if (existingCategory) {
      return res.status(400).json({
        error: `Overlapping category "${existingCategory.categoryName}" already exists for the given financial year range.`
      });
    }

    if (parseInt(rangeStart) >= parseInt(rangeEnd)) {
      return res.status(400).json({ error: 'Range start must be less than range end' });
    }

    const category = new InvoiceCategory({
      categoryName,
      financialYearStart: new Date(financialYearStart),
      financialYearEnd: new Date(financialYearEnd),
      rangeStart: parseInt(rangeStart),
      rangeEnd: parseInt(rangeEnd),
      prefix: prefix || '',
      companyId,
      currentSequence: parseInt(rangeStart),
    });

    await category.save();

    res.status(201).json({
      message: 'Invoice Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating invoice category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all invoice categories
// @route   GET /api/invoicecategory
const getAllInvoiceCategories = async (req, res) => {
  try {
    const { companyId, financialYearStart, financialYearEnd } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const filter = { companyId };

    if (financialYearStart && financialYearEnd) {
      filter.financialYearStart = { $gte: new Date(financialYearStart) };
      filter.financialYearEnd = { $lte: new Date(financialYearEnd) };
    }

    const categories = await InvoiceCategory.find(filter)
      .sort({ financialYearStart: -1, rangeStart: 1 });

    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Update an invoice category
// @route   PUT /api/invoicecategory/:id
const updateInvoiceCategory = async (req, res) => {
  try {
    const { categoryName, financialYearStart, financialYearEnd, prefix, rangeStart, rangeEnd, companyId } = req.body;

    if (!categoryName || !financialYearStart || !financialYearEnd || rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const existingCategory = await InvoiceCategory.findOne({
      _id: { $ne: req.params.id },
      companyId,
      $or: [
        {
          financialYearStart: { $lte: new Date(financialYearEnd) },
          financialYearEnd: { $gte: new Date(financialYearStart) }
        }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        error: `Overlapping category "${existingCategory.categoryName}" exists for the specified financial year range.`
      });
    }

    if (parseInt(rangeStart) >= parseInt(rangeEnd)) {
      return res.status(400).json({ error: 'Range start must be less than range end' });
    }

    const updated = await InvoiceCategory.findByIdAndUpdate(
      req.params.id,
      {
        categoryName,
        financialYearStart: new Date(financialYearStart),
        financialYearEnd: new Date(financialYearEnd),
        prefix: prefix || '',
        rangeStart: parseInt(rangeStart),
        rangeEnd: parseInt(rangeEnd),
        companyId
      },
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

// @desc    Delete an invoice category
// @route   DELETE /api/invoicecategory/:id
const deleteInvoiceCategory = async (req, res) => {
  try {
    const deleted = await InvoiceCategory.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// @desc    Generate next invoice number for a category
// @route   POST /api/invoicecategory/:id/generate-number
const generateInvoiceNumber = async (req, res) => {
  try {
    const category = await InvoiceCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.currentSequence > category.rangeEnd) {
      return res.status(400).json({
        error: `Invoice range exhausted for category ${category.categoryName}`
      });
    }

    const invoiceNumber = `${category.prefix}${category.financialYearStart.getFullYear()}-${category.financialYearEnd.getFullYear()}/${category.currentSequence.toString().padStart(4, '0')}`;

    await InvoiceCategory.findByIdAndUpdate(
      req.params.id,
      { $inc: { currentSequence: 1 } }
    );

    res.json({
      invoiceNumber,
      sequence: category.currentSequence,
      remaining: category.rangeEnd - category.currentSequence
    });
  } catch (err) {
    console.error('Error generating invoice number:', err);
    res.status(500).json({ error: 'Failed to generate invoice number' });
  }
};

// @desc    Get categories for current financial year
// @route   GET /api/invoicecategory/current-year
const getCurrentYearCategories = async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let financialYearStart, financialYearEnd;
    if (currentMonth >= 4) {
      financialYearStart = new Date(currentYear, 3, 1); // April 1
      financialYearEnd = new Date(currentYear + 1, 2, 31); // March 31
    } else {
      financialYearStart = new Date(currentYear - 1, 3, 1);
      financialYearEnd = new Date(currentYear, 2, 31);
    }

    const categories = await InvoiceCategory.find({
      companyId,
      financialYearStart: { $lte: financialYearEnd },
      financialYearEnd: { $gte: financialYearStart }
    }).sort({ rangeStart: 1 });

    res.json({
      financialYearStart,
      financialYearEnd,
      categories
    });
  } catch (err) {
    console.error('Error fetching current year categories:', err);
    res.status(500).json({ error: 'Failed to fetch current year categories' });
  }
};

module.exports = {
  createInvoiceCategory,
  getAllInvoiceCategories,
  updateInvoiceCategory,
  deleteInvoiceCategory,
  generateInvoiceNumber,
  getCurrentYearCategories
};
