const VendorPriceList = require('../../models/masterdata/VendorPriceList');

// Create Vendor Price List
exports.createVendorPrice = async (req, res) => {
  try {
    const { categoryId, vendorId, materialId, unit, bum, price, orderUnit, taxId, buyer, companyId, financialYear } = req.body;

    if (!categoryId || !vendorId || !materialId ||  !unit || !bum ) {
      return res.status(422).json({ message: 'All fields are required' });
    }

    const newEntry = new VendorPriceList(req.body);
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create vendor price entry' });
  }
};

// Get All
exports.getAllVendorPrices = async (req, res) => {
  try {

    const { companyId } = req.query;
    console.log("vendir prive", req.query)
    const filter = {};
    if (companyId) filter.companyId = companyId;


    const entries = await VendorPriceList.find(filter)
      .populate('categoryId', 'categoryName')
      .populate('vendorId', 'name1')
      .populate('materialId', 'description baseUnit orderUnit conversionValue');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vendor prices' });
  }
};

// Optional: Get by ID
exports.getVendorPriceById = async (req, res) => {
  try {
    const entry = await VendorPriceList.findById(req.params.id)
      .populate('categoryId')
      .populate('vendorId')
      .populate('materialId');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entry' });
  }
};

// // controllers/vendorPriceListController.js
// exports.updateVendorPriceList = async (req, res) => {
//     try {
//       const updated = await VendorPriceList.findByIdAndUpdate(req.params.id, req.body, { new: true });
//       res.json(updated);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: 'Failed to update Vendor Price List' });
//     }
//   };

// Update vendor price list
exports.updateVendorPriceList = async (req, res) => {
  try {
    console.log('Update request for ID:', req.params.id);
    console.log('Update data:', req.body);

    // Validate the ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Check if record exists first
    const existingRecord = await VendorPriceList.findById(req.params.id);
    if (!existingRecord) {
      return res.status(404).json({ error: 'Vendor Price List not found' });
    }

    // Perform the update
    const updated = await VendorPriceList.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    );

    console.log('Update successful:', updated);
    res.json(updated);
  } catch (err) {
    console.error('Error updating vendor price list:', err);
    res.status(500).json({ error: 'Failed to update Vendor Price List', details: err.message });
  }
};
