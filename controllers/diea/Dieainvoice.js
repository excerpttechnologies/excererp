const Invoice = require('../../models/DieaCompany/Dieainvoice');
const Company = require('../../models/DieaCompany/DieaModal');

const mongoose = require('mongoose');

exports.createInvoice = async (req, res) => {
  // Use transaction to ensure atomicity
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const {
      companyId,
      companyName,
      companyAddress,
      particulars,
      month,
      amount,
      previousBalance,
      currentBalance,
      amountInWords
    } = req.body;

    // Verify company exists
    const company = await Company.findById(companyId).session(session);
    if (!company) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get next invoice number
    const nextInvoiceNo = await Invoice.getNextInvoiceNumber();
    
    // Double-check the number doesn't exist (race condition protection)
    const existingInvoice = await Invoice.findOne({ 
      invoiceNo: nextInvoiceNo 
    }).session(session);
    
    if (existingInvoice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: 'Invoice number conflict. Please try again.'
      });
    }

    // Create invoice with the sequential number
    const invoice = new Invoice({
      invoiceNo: nextInvoiceNo,
      companyId,
      companyName,
      companyAddress,
      particulars,
      month,
      amount,
      previousBalance,
      currentBalance,
      amountInWords
    });
    
    await invoice.save({ session });

    // Update company's current balance
    await Company.findByIdAndUpdate(
      companyId,
      {
        previousBalance: previousBalance,
        currentBalance: currentBalance
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Invoice number already exists. Please try again.'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('companyId', 'companyName address')
      .sort({ invoiceNo: -1 });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('companyId', 'companyName address email phone');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get invoice by invoice number
exports.getInvoiceByNumber = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNo: req.params.invoiceNo })
      .populate('companyId', 'companyName address email phone');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if invoice number exists
exports.checkInvoiceNumberExists = async (req, res) => {
  try {
    const exists = await Invoice.exists({ invoiceNo: req.params.invoiceNo });
    
    res.status(200).json({
      success: true,
      exists: !!exists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get next available invoice number
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const nextNumber = await Invoice.getNextInvoiceNumber();
    
    res.status(200).json({
      success: true,
      nextInvoiceNumber: nextNumber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get invoices by company
exports.getInvoicesByCompany = async (req, res) => {
  try {
    const invoices = await Invoice.find({ companyId: req.params.companyId })
      .sort({ invoiceNo: -1 });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update invoice (prevent invoice number change)
exports.updateInvoice = async (req, res) => {
  try {
    // Remove invoiceNo from update data to prevent changes
    const { invoiceNo, ...updateData } = req.body;
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
      data: { invoiceNo: invoice.invoiceNo }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
