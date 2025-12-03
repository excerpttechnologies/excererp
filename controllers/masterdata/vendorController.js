const Vendor = require('../../models/masterdata/Vendor');
const VendorCategory = require('../../models/categories/VendorCategory');
const mongoose=require('mongoose')

async function generateVNNo(categoryId) {
  const category = await VendorCategory.findById(categoryId);
  const count = await Vendor.countDocuments({ categoryId });
  const nextNum = category.rangeFrom + count;
  return nextNum.toString().padStart(3, '0');
}

exports.createVendor = async (req, res) => {
  try {
    let vnNo;
    
    // Check if external vendor ID is provided
    if (req.body.vendorIdType === 'external' && req.body.externalVendorId) {
      // Check if external vendor ID already exists
      const existingVendor = await Vendor.findOne({ vnNo: req.body.externalVendorId });
      if (existingVendor) {
        return res.status(400).json({ error: 'Vendor ID already exists' });
      }
      vnNo = req.body.externalVendorId;
    } else {
      // Generate internal vendor ID
      vnNo = await generateVNNo(req.body.categoryId);
    }

    const newVendor = new Vendor({ 
      ...req.body, 
      vnNo,
      // Remove these fields from the saved data as they're not part of the schema
      vendorIdType: undefined,
      externalVendorId: undefined
    });
    
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all vendors
exports.getVendors = async (req, res) => {
  try {
     const { companyId,  } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    //if (financialYear) filter.financialYear = financialYear;


    const vendors = await Vendor.find(filter).populate('categoryId');
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update vendor
exports.updateVendor = async (req, res) => {
  try {
    const updated = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update isDeleted or isBlocked
exports.updateVendorStatus = async (req, res) => {
  try {
    const updated = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.query;

    const filter = {};

    // Filter by companyId and financialYear if provided
    if (companyId) filter.companyId = companyId;

    // If it's a valid ObjectId, include _id in the OR filter
    if (mongoose.Types.ObjectId.isValid(id)) {
      filter.$or = [
        { _id: id },
        { name1: id },
        { name: id }
      ];
    } else {
      filter.$or = [
        { name1: id },
        { name: id }
      ];
    }

    const vendor = await Vendor.findOne(filter);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.status(200).json(vendor);
  } catch (err) {
    console.error('Error fetching vendor:', err);
    res.status(500).json({ error: 'Failed to fetch vendor details' });
  }
};
