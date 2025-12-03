const StockItem = require('../../models/inventry/StockItemModel');

// Controller to get all items
const getAllItems = async (req, res) => {
    const {companyId, financialYear} = req.query;
    console.log("Fetching stock items for companyId:", companyId, "and financialYear:", financialYear);
    try {
        const items = await StockItem.find({ companyId}).populate('categoryId');
        console.log("Stock items fetched:", items);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error });
    }
};

module.exports = {
    getAllItems,
};