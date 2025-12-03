

const Payment = require('../../models/accounts/Payments');
const Invoice = require('../../models/accounts/Invoice');
const Billing = require('../../models/accounts/Billing');
const mongoose = require('mongoose');
// Helper function to get current financial year
function getCurrentFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // Assuming financial year starts from April (month 3)
  if (month >= 3) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

// POST /api/payment - Create a new payment record
const createPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    
    // Validate required fields
    if (!paymentData.recordId || !paymentData.paymentAmount || !paymentData.recordType) {
      return res.status(400).json({ 
        message: "Record ID, payment amount, and record type are required" 
      });
    }

    // Determine recordModel based on recordType
    const recordModel = paymentData.recordType === 'vendor' ? 'Invoice' : 'Billing';

    // Generate payment document number
    const count = await Payment.countDocuments({
      recordType: paymentData.recordType,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), 0, 1),
        $lt: new Date(new Date().getFullYear() + 1, 0, 1)
      }
    });
    
    const prefix = paymentData.recordType === 'vendor' ? 'VP' : 'CP';
    const year = new Date().getFullYear().toString().slice(-2);
    const sequence = (count + 1).toString().padStart(4, '0');
    const paymentDocNumber = `${prefix}${year}${sequence}`;

    // Create new payment record with all required fields
    const newPayment = new Payment({
      ...paymentData,
      recordModel: recordModel,
      paymentDocNumber: paymentDocNumber,
      createdBy: req.user?.username || 'system',
      financialYear: paymentData.financialYear || getCurrentFinancialYear(),
      companyId: paymentData.companyId,
      paymentDate: paymentData.paymentDate || new Date()
    });

    await newPayment.save();

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: newPayment,
      paymentDocNumber: newPayment.paymentDocNumber
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: err.message 
    });
  }
};

// GET /api/payment - Get all payments with filters
const getAllPayments = async (req, res) => {
  try {
    const { 
      recordType, 
      status, 
      paymentMethod, 
      startDate, 
      endDate, 
      entityName,
      companyId,
      financialYear,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    if (recordType) filter.recordType = recordType;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (entityName) filter.entityName = new RegExp(entityName, 'i');
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;
    
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get payments with pagination
    const payments = await Payment.find(filter)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recordId');

    // Get total count for pagination
    const totalCount = await Payment.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/payment/:id - Get single payment
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate('recordId');
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/payment/record/:recordId - Get payments for a specific record
const getPaymentsByRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const payments = await Payment.find({ recordId })
      .sort({ paymentDate: -1 });
    
    // Get payment summary using mongoose.Types.ObjectId properly
    const mongoose = require('mongoose');
    const summary = await Payment.aggregate([
      { $match: { recordId: new mongoose.Types.ObjectId(recordId) } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$paymentAmount' },
          paymentCount: { $sum: 1 },
          lastPaymentDate: { $max: '$paymentDate' },
          lastPaymentAmount: { $last: '$paymentAmount' }
        }
      }
    ]);
    
    res.json({
      payments,
      summary: summary[0] || {
        totalPaid: 0,
        paymentCount: 0,
        lastPaymentDate: null,
        lastPaymentAmount: 0
      }
    });
  } catch (err) {
    console.error("Error fetching payments by record:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PUT /api/payment/:id - Update payment
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: req.user?.username || 'system',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: "Payment updated successfully",
      payment: updatedPayment
    });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /api/payment/:id - Cancel payment
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cancelledPayment = await Payment.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        updatedBy: req.user?.username || 'system',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!cancelledPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: "Payment cancelled successfully",
      payment: cancelledPayment
    });
  } catch (err) {
    console.error("Error cancelling payment:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/payment-summary - Get payment analytics
const getPaymentSummary = async (req, res) => {
  try {
    const { companyId, recordType } = req.query;

    console.log('Summary request params:', { companyId, recordType });

    const matchFilter = {};
    if (companyId) matchFilter.companyId = new mongoose.Types.ObjectId(companyId);
    if (recordType) matchFilter.recordType = recordType;

    console.log('Match filter:', matchFilter);

    // Get summary by record type
    const summary = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$recordType',
          totalAmount: { $sum: '$paymentAmount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$paymentAmount' }
        }
      }
    ]);

    // Get summary by payment method
    const methodSummary = await Payment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$paymentAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get today's summary
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayFilter = {
      ...matchFilter,
      paymentDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    };

    const todaySummary = await Payment.aggregate([
      { $match: todayFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$paymentAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Summary results:', { summary, methodSummary, todaySummary });

    res.json({
      byType: summary,
      byMethod: methodSummary,
      today: todaySummary[0] || { totalAmount: 0, count: 0 }
    });
  } catch (err) {
    console.error("Error getting payment summary:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByRecord,
  updatePayment,
  deletePayment,
  getPaymentSummary
};