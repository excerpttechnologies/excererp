
const GoodsIssue = require('../../models/inventry/GoodsIssue');
const GoodsIssueCategory = require('../../models/categories/GoodsIssueCategory'); // ensure this model exists
const mongoose = require('mongoose');
const StockItem = require('../../models/inventry/StockItemModel'); // Assuming you have a StockItem model
// POST /api/goodsissue
const createGoodsIssue = async (req, res) => {
  try {
    const data = req.body;

    // Validate category name
    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Fetch category info from DB
    const category = await GoodsIssueCategory.findOne({ categoryName: data.category });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Count goods issues already created with this category
    const issueCount = await GoodsIssue.countDocuments({ category: data.category });
    const nextNumber = category.rangeStart + issueCount;

    // Optional: Check against rangeEnd if needed
    if (category.rangeEnd && nextNumber > category.rangeEnd) {
      return res.status(400).json({ message: "Document number range exceeded for this category." });
    }

    // Create docnumber using prefix and nextNumber
    const docnumber = `${nextNumber}`;

    const newIssue = new GoodsIssue({
      ...data,
      docnumber
    });
    console.log("New Goods Issue Data:", newIssue);
    console.log("data:", data);
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        const filter = {
          materialId: item.materialId,
          location: data.location,
          lotNumber: item.lotNo || undefined
        };
        let stockItem = await StockItem.findOne(filter);

        if (stockItem) {
          // If material is present in that location, subtract the quantity
          stockItem.quantityAvailable = Number(stockItem.quantityAvailable) - Number(item.quantity);
          stockItem.updatedAt = new Date();
          await stockItem.save();
        }
      }
    }

    await newIssue.save();
    res.status(201).json({ message: "Goods issue created", docnumber });
  } catch (err) {
    console.error("Error saving goods issue:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// GET /api/goodsissue
const getAllGoodsIssues = async (req, res) => {
  try {
    const issues = await GoodsIssue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error("Error fetching goods issues:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateGoodsIssue = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  console.log("Update Data:", id, updateData);

  // Validate ObjectId if using MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    // Optional: log if the document exists before update
    const found = await GoodsIssue.findById(id);
    if (!found) {
      return res.status(404).json({ message: "Goods issue not found" });
    }

    const updatedIssue = await GoodsIssue.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedIssue);
  } catch (err) {
    console.error("Error updating goods issue:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  createGoodsIssue,
  getAllGoodsIssues,
  updateGoodsIssue
};
