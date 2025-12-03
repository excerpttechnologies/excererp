const Invoice = require('../../models/accounts/Invoice');
const InvoiceCategory = require('../../models/categories/InvoiceCategory');

// POST /api/invoiceform
// const createInvoice = async (req, res) => {
//   try {
//     const data = req.body;

//     if (!data.category) {
//       return res.status(400).json({ message: "Category is required" });
//     }

//     const category = await InvoiceCategory.findOne({ categoryName: data.category });

//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     const invoiceCount = await Invoice.countDocuments({ category: data.category });
//     const nextNumber = category.rangeStart + invoiceCount;

//     if (category.rangeEnd && nextNumber > category.rangeEnd) {
//       return res.status(400).json({ message: "Document number range exceeded for this category." });
//     }

//     // const docnumber = `${nextNumber}`;
//     const docnumber= /api/invoicecategory/:id/generate-number
//   const totalAmount = data.items?.reduce((sum, item) => {
//       return sum + ((item.quantity || 0) * (item.price || 0));
//     }, 0);

//     const discount = parseFloat(data.discount || 0);

//     // ✅ 2. Net amount after discount
//     const netAmount = totalAmount - discount;

//     const newInvoice = new Invoice({
//       ...data,
//       docnumber,
//     });

//     await newInvoice.save();
//     res.status(201).json({ message: "Invoice created", docnumber });
//   } catch (err) {
//     console.error("Error creating invoice:", err);
//     res.status(500).json({ message: "Internal Server Error", error: err.message });
//   }
// };
const createInvoice = async (req, res) => {
  try {
    const data = req.body;

    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Find category by categoryName
    const category = await InvoiceCategory.findOne({ categoryName: data.category });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Generate invoice number using instance method
    const sequence = await category.getNextSequence(); // Automatically increments sequence and saves

    const fyStartYear = category.financialYearStart.getFullYear();
    const fyEndYear = category.financialYearEnd.getFullYear();
    const docnumber = `${category.prefix}${fyStartYear}-${fyEndYear}/${sequence.toString().padStart(4, '0')}`;

    const totalAmount = data.items?.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.price || 0));
    }, 0);

    const discount = parseFloat(data.discount || 0);
    const netAmount = totalAmount - discount;

    const newInvoice = new Invoice({
      ...data,
      docnumber,
    });

    await newInvoice.save();

    res.status(201).json({ message: "Invoice created", docnumber });
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// GET /api/invoiceform
const getAllInvoices = async (req, res) => {
  try {
    const { companyId } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /api/invoiceform/:id - Update invoice record (for payments)
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the existing invoice record
    const existingInvoice = await Invoice.findById(id);
    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice record not found" });
    }

    // Update the invoice record
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice
    });
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// GET /api/invoiceform/:id - Get single invoice record
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ message: "Invoice record not found" });
    }

    res.json(invoice);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  updateInvoice,
  getInvoiceById
};
