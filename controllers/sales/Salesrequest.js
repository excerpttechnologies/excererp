const SalesRequest = require('../../models/sales/Salesrequest');
const Salecategory = require('../../models/categories/SalesReuestcat');

exports.createIndent = async (req, res) => {
  try {
    const { indentIdType, externalIndentId, categoryId, items } = req.body;

    let indentId;
    console.log('Received categoryId:', categoryId);
    console.log('Received items:', req.body);

    const category = await Salecategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (indentIdType === 'external') {
      if (!externalIndentId || externalIndentId.trim() === '') {
        return res.status(400).json({ error: 'External Indent ID is required' });
      }

      if (externalIndentId.length > 50) {
        return res.status(400).json({ error: 'External Indent ID cannot exceed 50 characters' });
      }

      // Validate special characters or format
      const validIdPattern = /^[A-Za-z0-9_-]+$/;
      if (!validIdPattern.test(externalIndentId)) {
        return res.status(400).json({ error: 'External Indent ID can only contain letters, numbers, hyphens, and underscores' });
      }
      
      indentId = externalIndentId;
      
      // Check for duplicate external indent ID
      const existingExternal = await SalesRequest.findOne({ indentId: externalIndentId });
      if (existingExternal) {
        return res.status(409).json({ error: 'External Indent ID already exists' });
      }

    } else if (indentIdType === 'internal') {
      if (!category.rangeStart) {
        return res.status(400).json({ error: 'Category range start not defined' });
      }

      const rangeStart = category.rangeStart;
      console.log('Category rangeStart:', rangeStart);

      // Find all internal indents for this category to get the highest number
      const existingIndents = await SalesRequest.find({
        categoryId,
        indentIdType: 'internal'
      }).select('indentId');

      let nextNumber = rangeStart;

      if (existingIndents.length > 0) {
        console.log('Found existing indents:', existingIndents.length);
        
        // Extract all numbers and find the maximum
        const usedNumbers = existingIndents
          .map(indent => parseInt(indent.indentId, 10))
          .filter(num => !isNaN(num));

        if (usedNumbers.length > 0) {
          const maxUsedNumber = Math.max(...usedNumbers);
          console.log('Highest used number:', maxUsedNumber);
          nextNumber = maxUsedNumber + 1;
        }
      }

      // Optional: Check range limit if category has rangeEnd
      if (category.rangeEnd && nextNumber > category.rangeEnd) {
        return res.status(400).json({ 
          error: `Indent number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeEnd}` 
        });
      }

      console.log('Next indent number:', nextNumber);
      
      indentId = `${nextNumber.toString().padStart(6, '0')}`;

      console.log('Generated internal indentId:', indentId);

      // Double-check uniqueness to prevent race conditions
      const existingIndent = await SalesRequest.findOne({ indentId, categoryId });
      if (existingIndent) {
        return res.status(409).json({ error: `Indent ID ${indentId} already exists` });
      }
    }

    // Create the new indent
    const newIndent = new SalesRequest({
      ...req.body,
      indentId,
      categoryId,
      categoryName: category.categoryName,
      items,
    });

    await newIndent.save();

    res.status(201).json({ message: 'Indent created successfully', indentId });
    
  } catch (err) {
    console.error('Error in createIndent:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};




// controllers/indentController.js
exports.getAllIndents = async (req, res) => { 
  try {
    const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    const allIndents = await SalesRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json(allIndents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch indents' });
  }
};
