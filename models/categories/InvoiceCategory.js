const mongoose = require('mongoose');

const invoiceCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  financialYearStart: {
    type: Date,
    required: [true, 'Financial year start date is required']
  },
  financialYearEnd: {
    type: Date,
    required: [true, 'Financial year end date is required']
  },
  prefix: {
    type: String,
    default: '',
    trim: true,
    maxlength: [10, 'Prefix cannot exceed 10 characters'],
    uppercase: true
  },
  rangeStart: {
    type: Number,
    required: [true, 'Range start is required'],
    min: [1, 'Range start must be at least 1'],
    max: [999999, 'Range start cannot exceed 999999']
  },
  rangeEnd: {
    type: Number,
    required: [true, 'Range end is required'],
    min: [1, 'Range end must be at least 1'],
    max: [999999, 'Range end cannot exceed 999999'],
    validate: {
      validator: function(value) {
        return value > this.rangeStart;
      },
      message: 'Range end must be greater than range start'
    }
  },
  currentSequence: {
    type: Number,
    default: function() {
      return this.rangeStart;
    }
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Company ID is required'],
    ref: 'Company'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to optimize querying by company and financial year
invoiceCategorySchema.index({ companyId: 1, financialYearStart: 1, financialYearEnd: 1 });
invoiceCategorySchema.index({ companyId: 1, isActive: 1 });

// Pre-save middleware to check for overlapping ranges in the same financial year
invoiceCategorySchema.pre('save', async function(next) {
  if (this.isModified('rangeStart') || this.isModified('rangeEnd') || this.isNew) {
    const overlappingCategory = await this.constructor.findOne({
      _id: { $ne: this._id },
      companyId: this.companyId,
      financialYearStart: this.financialYearStart,
      financialYearEnd: this.financialYearEnd,
      isActive: true,
      $or: [
        {
          rangeStart: { $lte: this.rangeEnd },
          rangeEnd: { $gte: this.rangeStart }
        }
      ]
    });

    if (overlappingCategory) {
      const error = new Error(`Range overlaps with existing category "${overlappingCategory.categoryName}" in this financial year`);
      error.name = 'ValidationError';
      return next(error);
    }
  }

  next();
});

// Instance method to generate invoice number
invoiceCategorySchema.methods.generateInvoiceNumber = function() {
  if (this.currentSequence > this.rangeEnd) {
    throw new Error(`Invoice range exhausted for category ${this.categoryName}`);
  }

  const fyStartYear = this.financialYearStart.getFullYear();
  const fyEndYear = this.financialYearEnd.getFullYear();
  const invoiceNumber = `${this.prefix}${fyStartYear}-${fyEndYear}/${this.currentSequence.toString().padStart(4, '0')}`;

  return invoiceNumber;
};

// Instance method to get next sequence and increment
invoiceCategorySchema.methods.getNextSequence = async function() {
  if (this.currentSequence > this.rangeEnd) {
    throw new Error(`Invoice range exhausted for category ${this.categoryName}`);
  }

  const currentSequence = this.currentSequence;
  this.currentSequence += 1;
  await this.save();
  
  return currentSequence;
};

// Static method to get current financial year range as dates
invoiceCategorySchema.statics.getCurrentFinancialYearRange = function() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let fyStart, fyEnd;
  if (currentMonth >= 4) { // April onwards
    fyStart = new Date(currentYear, 3, 1);    // April 1
    fyEnd = new Date(currentYear + 1, 2, 31); // March 31
  } else { // Jan–March
    fyStart = new Date(currentYear - 1, 3, 1);
    fyEnd = new Date(currentYear, 2, 31);
  }

  return { financialYearStart: fyStart, financialYearEnd: fyEnd };
};

// Static method to find active categories available for invoice generation
invoiceCategorySchema.statics.findActiveForGeneration = function(companyId, financialYearStart, financialYearEnd) {
  return this.find({
    companyId,
    financialYearStart,
    financialYearEnd,
    isActive: true,
    $expr: { $lt: ['$currentSequence', '$rangeEnd'] }
  }).sort({ rangeStart: 1 });
};

module.exports = mongoose.model('InvoiceCategory', invoiceCategorySchema);
