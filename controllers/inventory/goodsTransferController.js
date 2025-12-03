const GoodsTransfer = require('../../models/inventry/GoodsTransfer');
const GoodsTransferCategory = require('../../models/categories/GoodsTransferCategory');

// POST /api/goodstransfer
const createGoodsTransfer = async (req, res) => {
  try {
    const data = req.body;

    // Validate
    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const category = await GoodsTransferCategory.findOne({ categoryName: data.category });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const count = await GoodsTransfer.countDocuments({ category: data.category });
    const nextNumber = category.rangeStart + count;

    if (category.rangeEnd && nextNumber > category.rangeEnd) {
      return res.status(400).json({ message: "Document number range exceeded for this category." });
    }

    const docnumber = `${nextNumber}`;

    const newTransfer = new GoodsTransfer({
      ...data,
      docnumber
    });

    await newTransfer.save();
    res.status(201).json({ message: "Goods Transfer Created", docnumber });
  } catch (err) {
    console.error("Error saving goods transfer:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// GET /api/goodstransfer
const getAllGoodsTransfers = async (req, res) => {
  try {
    const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;

    const transfers = (await GoodsTransfer.find(filter).sort({ createdAt: -1 }));
    res.json(transfers);
  } catch (err) {
    console.error("Error fetching goods transfers:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// OPTIONAL: GET by docnumber
const getGoodsTransferByDocNumber = async (req, res) => {
  try {
    const { docnumber } = req.params;
    const transfer = await GoodsTransfer.findOne({ docnumber });

    if (!transfer) {
      return res.status(404).json({ message: "Goods Transfer not found" });
    }

    res.json(transfer);
  } catch (err) {
    console.error("Error fetching goods transfer:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Export
module.exports = {
  createGoodsTransfer,
  getAllGoodsTransfers,
  getGoodsTransferByDocNumber, // optional
};
