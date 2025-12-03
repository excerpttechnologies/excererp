const Billing = require('../../models/accounts/Billing');
const BillingCategory = require('../../models/categories/BillingCategory');

// POST /api/Billingform
const createBilling = async (req, res) => {
  try {
    const data = req.body;

    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Find the category
    const category = await BillingCategory.findOne({ categoryName: data.category });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Generate next billing number using the category's method
    let docnumber;
    try {
      const nextSequence = await category.getNextSequence();
      const fyStartYear = category.financialYearStart.getFullYear();
      const fyEndYear = category.financialYearEnd.getFullYear();
      docnumber = `${category.prefix}${fyStartYear}-${fyEndYear}/${nextSequence.toString().padStart(4, '0')}`;
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Calculate totals
    const totalAmount = data.items?.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.price || 0));
    }, 0);

    const discount = parseFloat(data.discount || 0);
    const netAmount = totalAmount - discount;


    const newBilling = new Billing({
      ...data,
      docnumber,

    });

    await newBilling.save();
    res.status(201).json({ message: "Billing created", docnumber });
  } catch (err) {
    console.error("Error creating Billing:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// GET /api/Billingform
const getAllBillings = async (req, res) => {
  const { companyId } = req.query;
  try {
    const filter = {};
    if (companyId) filter.companyId = companyId;
    const billings = await Billing.find(filter).sort({ createdAt: -1 }).populate("salesOrderId");
    res.json(billings);
  } catch (err) {
    console.error("Error fetching Billings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /api/Billingform/:id
const updateBilling = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingBilling = await Billing.findById(id);
    if (!existingBilling) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    const updatedBilling = await Billing.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate("salesOrderId");

    res.json({
      message: "Billing updated successfully",
      billing: updatedBilling
    });
  } catch (err) {
    console.error("Error updating billing:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// GET /api/Billingform/:id
const getBillingById = async (req, res) => {
  try {
    const { id } = req.params;
    const billing = await Billing.findById(id).populate("salesOrderId");

    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    res.json(billing);
  } catch (err) {
    console.error("Error fetching billing:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = {
  createBilling,
  getAllBillings,
  updateBilling,
  getBillingById
};
