const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Reference to the record being paid
  recordType: {
    type: String,
    required: true
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recordModel'
  },
  recordModel: {
    type: String,
    required: true,
    enum: ['Invoice', 'Billing']
  },
  
  // Document details
  docnumber: {
    type: String,
    required: true
  },
  paymentDocNumber: {
    type: String,
    required: true
  },
  
  // Entity details
  entityName: {
    type: String,
    required: true
  },
  entityId: {
    type: String
  },
  
  // Payment details
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  previousBalance: {
    type: Number,
    required: true
  },
  newBalance: {
    type: Number,
    required: true
  },
  
  // Payment method and details
  paymentMethod: {
    type: String,
    enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'card', 'other'],
    required: true,
    default: 'cash'
  },
  
  // Additional payment details based on method
  paymentDetails: {
    chequeNumber: String,
    bankName: String,
    accountNumber: String,
    upiId: String,
    cardLastFour: String,
    transactionId: String,
    clearanceDate: Date
  },
  
  // Description and notes
  description: {
    type: String,
    maxlength: 500
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  
  // Dates
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'cleared', 'bounced', 'cancelled'],
    default: 'cleared'
  },
  
  // Financial year and company
  financialYear: {
    type: String
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Audit fields
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  financialYear: {
    type: String,
  },
  // Additional metadata
  tags: [String],
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    uploadDate: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
paymentSchema.index({ recordId: 1, paymentDate: -1 });
paymentSchema.index({ entityName: 1, paymentDate: -1 });
paymentSchema.index({ paymentDocNumber: 1 });
paymentSchema.index({ recordType: 1, status: 1 });
paymentSchema.index({  companyId: 1 });

// Virtual for formatted payment amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `₹${this.paymentAmount.toFixed(2)}`;
});

// Virtual for payment age
paymentSchema.virtual('paymentAge').get(function() {
  const diffTime = Math.abs(new Date() - this.paymentDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to generate payment document number
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.paymentDocNumber) {
    const count = await this.constructor.countDocuments({
      recordType: this.recordType,
      paymentDate: {
        $gte: new Date(new Date().getFullYear(), 0, 1),
        $lt: new Date(new Date().getFullYear() + 1, 0, 1)
      }
    });
    
    const prefix = this.recordType === 'vendor' ? 'VP' : 'CP';
    const year = new Date().getFullYear().toString().slice(-2);
    const sequence = (count + 1).toString().padStart(4, '0');
    
    this.paymentDocNumber = `${prefix}${year}${sequence}`;
  }
  next();
});

// Static method to get payment summary
paymentSchema.statics.getPaymentSummary = async function(recordId) {
  return await this.aggregate([
    { $match: { recordId: mongoose.Types.ObjectId(recordId) } },
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
};

// Instance method to format payment details
paymentSchema.methods.getPaymentDetails = function() {
  const details = {
    amount: this.formattedAmount,
    method: this.paymentMethod,
    date: this.paymentDate.toLocaleDateString(),
    status: this.status
  };

  if (this.paymentDetails) {
    switch (this.paymentMethod) {
      case 'cheque':
        details.chequeNumber = this.paymentDetails.chequeNumber;
        details.bankName = this.paymentDetails.bankName;
        break;
      case 'bank_transfer':
        details.accountNumber = this.paymentDetails.accountNumber;
        details.transactionId = this.paymentDetails.transactionId;
        break;
      case 'upi':
        details.upiId = this.paymentDetails.upiId;
        details.transactionId = this.paymentDetails.transactionId;
        break;
      case 'card':
        details.cardLastFour = this.paymentDetails.cardLastFour;
        break;
    }
  }

  return details;
};

module.exports = mongoose.model('Payment', paymentSchema);