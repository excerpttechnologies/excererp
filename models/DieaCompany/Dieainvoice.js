const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: {
    type: Number,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyAddress: {
    type: String,
    required: true
  },
  particulars: {
    type: String,
    required: true,
    default: 'Maintenance Charge'
  },
  month: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  previousBalance: {
    type: Number,
    required: true,
    default: 0
  },
  currentBalance: {
    type: Number,
    required: true
  },
  amountInWords: {
    type: String,
    required: true
  }
}, { timestamps: true });


// ⭐ STATIC METHOD TO GET NEXT INVOICE NUMBER
invoiceSchema.statics.getNextInvoiceNumber = async function () {
  const lastInvoice = await this.findOne().sort({ invoiceNo: -1 });
  return lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
};


// ⭐ PRE-SAVE HOOK TO AUTO-INCREMENT
invoiceSchema.statics.getNextInvoiceNumber = async function() {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Find the last invoice number
      const lastInvoice = await this.findOne()
        .sort({ invoiceNo: -1 })
        .select('invoiceNo')
        .lean();
      
      // Start from 1001 if no invoices exist
      const nextNumber = lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
      
      // Check if this number already exists (safety check)
      const exists = await this.findOne({ invoiceNo: nextNumber }).lean();
      
      if (!exists) {
        return nextNumber;
      }
      
      // If number exists, increment and try again
      retries++;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw new Error('Failed to generate invoice number after multiple attempts');
      }
    }
  }
  
  throw new Error('Could not generate unique invoice number');
};

// Pre-save hook to ensure invoice number is set
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNo) {
    try {
      this.invoiceNo = await this.constructor.getNextInvoiceNumber();
    } catch (error) {
      return next(error);
    }
  }
  next();
});
module.exports = mongoose.model('Invoicediea', invoiceSchema);
