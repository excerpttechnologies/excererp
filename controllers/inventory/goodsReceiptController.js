const GoodsReceipt = require('../../models/inventry/GoodsReceipt');
const GoodsReceiptCategory =require('../../models/categories/GoodsReceiptCategory')// reused for receipt category
const StockItem = require('../../models/inventry/StockItemModel'); // Assuming you have a StockItem model
const Material = require('../../models/masterdata/Material');
// POST /api/goodsreceipt
const createGoodsReceipt = async (req, res) => {
  try {
    const data = req.body;

    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const category = await GoodsReceiptCategory.findOne({ categoryName: data.category });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const receiptCount = await GoodsReceipt.countDocuments({ category: data.category });
    const nextNumber = category.rangeStart + receiptCount;

    if (category.rangeEnd && nextNumber > category.rangeEnd) {
      return res.status(400).json({ message: "Document number range exceeded for this category." });
    }

    const docnumber = `${nextNumber}`;

    const newReceipt = new GoodsReceipt({
      ...data,
      docnumber
    });

    console.log("New Goods Receipt Data:", newReceipt);
    console.log("data:", data.items);

    // Update stock for each item in the receipt
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
      const filter = { materialId: item.materialId, location: data.location || newReceipt.location, lotNumber: item.lotNo || undefined };
      let stockItem = await StockItem.findOne(filter);

      if (stockItem) {
        stockItem.quantityAvailable = Number(stockItem.quantityAvailable) + Number(item.quantity);
        stockItem.updatedAt = new Date();
        await stockItem.save();
      } else {
        const material = await Material.findOne({ materialId: item.materialId , companyId: data.companyId });
        console.log("Material found for stock item:", material);
        await StockItem.create({
        materialId: item.materialId,
        description: item.description,
        companyId: data.companyId,
        financialYear: data.financialYear,
        categoryId: material.categoryId,
        baseUnit: item.baseUnit,
        location: data.location || newReceipt.location,
        quantityAvailable: item.quantity,
        lotNumber: item.lotNo || undefined
        });
      }
      }
    }

    await newReceipt.save();
    res.status(201).json({ message: "Goods receipt created", docnumber });
  } catch (err) {
    console.error("Error saving goods receipt:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// GET /api/goodsreceipt
const getAllGoodsReceipts = async (req, res) => {
  
  try {
    const receipts = await GoodsReceipt.find().sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    console.error("Error fetching goods receipts:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateGoodsReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReceipt = await GoodsReceipt.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedReceipt) {  
      return res.status(404).json({ message: "Goods receipt not found" });
    }
    res.json({ message: "Goods receipt updated successfully", updatedReceipt });
  } catch (err) {
    console.error("Error updating goods receipt:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = {
  createGoodsReceipt,
  getAllGoodsReceipts,
  updateGoodsReceipt
};
