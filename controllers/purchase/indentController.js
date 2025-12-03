// const IndentRequest = require('../models/IndentRequestModel');
// const PurchaseCategory = require('../models/purchaserequestmodel');

// exports.createIndent = async (req, res) => {
//   try {
//     const { categoryId, items } = req.body;

//     console.log('Received categoryId:', categoryId);
//     console.log('Received items:', items);
//     const category = await PurchaseCategory.findById(categoryId);
//     if (!category) return res.status(404).json({ message: 'Category not found' });

//     const prefix = category.prefix;

//     const latest = await IndentRequest.findOne({ indentId: { $regex: `^${prefix}-` } })
//       .sort({ createdAt: -1 });

//     let nextNumber = 1;
//     if (latest && latest.indentId) {
//       const lastId = latest.indentId.split('-')[1];
//       nextNumber = parseInt(lastId) + 1;
//     }

//     const indentId = `${prefix}-${String(nextNumber).padStart(4, '0')}`;

//     const newIndent = new IndentRequest({
//       indentId,
//       categoryId,
//       categoryName: category.name,
//       items
//     });

//     await newIndent.save();

//     res.status(201).json({ message: 'Indent created', indentId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const IndentRequest = require('../../models/purchase/IndentRequestModel');
const PurchaseCategory = require('../../models/purchase/purchaserequestmodel');

// exports.createIndent = async (req, res) => {
//   try {
//     const { indentIdType, externalIndentId, categoryId, items, financialYear,companyId} = req.body;

//     let indentId;
//     console.log('Received categoryId:', categoryId);
//     console.log('Received items:', req.body);

//     const category = await PurchaseCategory.findById(categoryId);
//     if (!category) return res.status(404).json({ message: 'Category not found' });


//     if (indentIdType === 'external') {
//       if (!externalIndentId || externalIndentId.trim() === '') {
//         return res.status(400).json({ error: 'External Indent ID is required' });
//       }

//       if (externalIndentId.length > 50) {
//         return res.status(400).json({ error: 'External Indent ID cannot exceed 50 characters' });
//       }

//       // Optional: Add validation for special characters or format
//       const validIdPattern = /^[A-Za-z0-9_-]+$/;
//       if (!validIdPattern.test(externalIndentId)) {
//         return res.status(400).json({ error: 'External Indent ID can only contain letters, numbers, hyphens, and underscores' });
//       }
//       indentId = externalIndentId;
//     } else if (indentIdType === 'internal') {
//       if (!category.rangeStart) {
//         return res.status(400).json({ error: 'Category range start not defined' });
//       }
      
//       const rangeStart = category.rangeStart;
//       console.log('Category rangeStart:', rangeStart);
//       // Find latest indent for this specific category
//       const latest = await IndentRequest.findOne({ categoryId, indentIdType: 'internal' })
//         .sort({ createdAt: -1 });
//       console.log('Latest indent found:', latest);
//       let nextNumber = rangeStart;
//       if (latest && latest.indentId) {
//         const lastNumber = parseInt(latest.indentId);
//         nextNumber = lastNumber + 1;
//       }
//       console.log('Next indent number:', nextNumber);
//       indentId = `${nextNumber}`;
//       console.log('Generated internal indentId:', indentId);
//     }
//     if (indentId !== "") {
//       const newIndent = new IndentRequest({
//         indentId,
//         categoryId,
//         indentIdType,
//         companyId,
//         financialYear,
//         documentDate: req.body.documentDate || '', // Optional field, can be empty
//         location: req.body.location || '', // Optional field, can be empty
//         buyerGroup: req.body.buyerGroup || '', // Optional field, can be empty
//         categoryName: category.categoryName,
//         items,
//       });

//       await newIndent.save();

//       res.status(201).json({ message: 'Indent created successfully', indentId });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// controllers/indentController.js

exports.createIndent = async (req, res) => {
  try {
    const { indentIdType, externalIndentId, categoryId, items, financialYear, companyId } = req.body;

    let indentId;
    console.log('Received categoryId:', categoryId);
    console.log('Received items:', req.body);

    const category = await PurchaseCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (indentIdType === 'external') {
      if (!externalIndentId || externalIndentId.trim() === '') {
        return res.status(400).json({ error: 'External Indent ID is required' });
      }
      if (externalIndentId.length > 50) {
        return res.status(400).json({ error: 'External Indent ID cannot exceed 50 characters' });
      }
      const validIdPattern = /^[A-Za-z0-9_-]+$/;
      if (!validIdPattern.test(externalIndentId)) {
        return res.status(400).json({ error: 'External Indent ID can only contain letters, numbers, hyphens, and underscores' });
      }
      indentId = externalIndentId;
      // Optional: Check for duplicate
      const existing = await IndentRequest.findOne({ indentId });
      if (existing) {
        return res.status(409).json({ error: 'External Indent ID already exists' });
      }
    } else if (indentIdType === 'internal') {
      if (!category.rangeStart) {
        return res.status(400).json({ error: 'Category range start not defined' });
      }
      const rangeStart = category.rangeStart;
      let nextNumber = rangeStart;

      // Find all internal indents for this category, select indentId only
      const existingIndents = await IndentRequest.find({
        categoryId,
        indentIdType: 'internal'
      }).select('indentId');

      if (existingIndents.length > 0) {
        const usedNumbers = existingIndents
          .map(i => parseInt(i.indentId, 10))
          .filter(num => !isNaN(num));
        if (usedNumbers.length > 0) {
          const maxUsedNumber = Math.max(...usedNumbers);
          nextNumber = maxUsedNumber + 1;
        }
      }

      // Optional: Check for upper range
      if (category.rangeEnd && nextNumber > category.rangeEnd) {
        return res.status(400).json({ error: `Indent number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeEnd}` });
      }

      // Zero-pad to 6 digits (optional, for consistency)
      indentId = `${nextNumber.toString().padStart(6, '0')}`;
      // Double-check race condition
      const existing = await IndentRequest.findOne({ indentId, categoryId });
      if (existing) {
        return res.status(409).json({ error: `Indent ID ${indentId} already exists` });
      }
    }

    if (indentId) {
      const newIndent = new IndentRequest({
        indentId,
        categoryId,
        indentIdType,
        companyId,
        financialYear,
        documentDate: req.body.documentDate || '',
        location: req.body.location || '',
        buyerGroup: req.body.buyerGroup || '',
        categoryName: category.categoryName,
        items,
      });

      await newIndent.save();
      return res.status(201).json({ message: 'Indent created successfully', indentId });
    } else {
      return res.status(400).json({ error: 'Failed to generate indent ID' });
    }
  } catch (err) {
    console.error('Error in createIndent:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getAllIndents = async (req, res) => {

  try {
     const { companyId } = req.query;
console.log('Fetching all indents for companyId:', companyId);
    const filter = {};
    if (companyId) filter.companyId = companyId;
 

    const allIndents = await IndentRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json(allIndents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch indents' });
  }
};


// Add this to your indent routes
exports.updateIndentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isDeleted, isBlocked } = req.body;
        
        const updateData = {};
        if (typeof isDeleted === 'boolean') {
            updateData.isDeleted = isDeleted;
        }
        if (typeof isBlocked === 'boolean') {
            updateData.isBlocked = isBlocked;
        }
        
        const updated = await IndentRequest.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updated) {
            return res.status(404).json({ error: 'Indent not found' });
        }
        
        res.json({ message: 'Indent status updated', indent: updated });
    } catch (err) {
        console.error('Error updating indent status:', err);
        res.status(500).json({ error: 'Failed to update indent status' });
    }
};