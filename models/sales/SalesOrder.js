// const mongoose = require('mongoose');

// const ItemSchema = new mongoose.Schema({
//   materialId: String,
//   description: String,
//   quantity: Number,
//   baseUnit: String,
//   unit: String,
  
//   materialGroup: String,
//   price: Number,
//   priceUnit: String,
//   deliveryDate: String,
//   note: String,
// });

// const SalesOrderSchema = new mongoose.Schema({
//   soNumber: String,
//   salesGroup: String,
//   contactPerson: String,
//   quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesQuotation' },
//   quotationNumber: String,
//   categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrderCategory' },
//   category: String,
//   date: String,
//   generalCondition: [],
//   customerName: String,
//   deliveryLocation: String,
//   deliveryAddress: String,
//   items: [ItemSchema],
//   total: Number,
//   companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
//   financialYear: String,
//   taxName: String,
//   cgst: Number,
//   sgst: Number,
//   igst: Number,
//   taxDiscount: Number,
//   finalTotal: Number,
// }, { timestamps: true });

// module.exports = mongoose.model('SalesOrder', SalesOrderSchema);

const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  quantity: Number,
  baseUnit: String,
  unit: String,
  orderUnit: String, // Added missing field
  materialGroup: String,
  materialgroup: String, // Keep both for compatibility
  price: Number,
  priceUnit: String,
  deliveryDate: String,
  note: String,
  salesGroup: String, // Added for item-level sales group
  
  // Individual item tax fields
  selectedTax: {
    taxName: String,
    cgst: Number,
    sgst: Number,
    igst: Number
  },
  cgst: Number,
  sgst: Number,
  igst: Number,
  discount: Number, // Item-level discount
  itemSubtotal: Number, // Calculated subtotal before tax
  cgstAmount: Number, // Calculated CGST amount
  sgstAmount: Number, // Calculated SGST amount
  igstAmount: Number, // Calculated IGST amount
  itemTotalWithTax: Number, // Final item total with tax
});

const SalesOrderSchema = new mongoose.Schema({
  soNumber: String,
  salesGroup: String,
  contactPerson: String,
  
  // Reference document fields (enhanced)
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesQuotation' },
  quotationNumber: String,
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' }, // For reference SO
  referenceSalesOrderNumber: String,
  referenceDocumentNumber: String, // Generic reference field
  
  // Category and classification
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrderCategory' },
  category: String,
  date: String,
  
  // General conditions and processes
  generalCondition: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GeneralCondition' }],
  selectedConditions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GeneralCondition' }], // Alternative field name
  selectedProcesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Process' }],
  
  // Customer and delivery information
  customerName: String,
  deliveryLocation: String,
  deliveryAddress: String,
  
  // Payment and validity
  payTerms: String, // Payment terms/Header notes
  validityDate: String,
  
  // Approval and preparation
  preparedby: String,
  approvedby: String,
  remarks: String,
  
  // Items array with enhanced tax calculation
  items: [ItemSchema],
  
  // Order totals
  total: Number, // Subtotal before tax
  
  // Company and financial year
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  
  // Tax information (header level - for compatibility)
  taxName: String,
  cgst: Number,
  sgst: Number,
  igst: Number,
  taxDiscount: Number,
  
  // Calculated tax amounts (aggregated from items)
  cgstAmount: Number,
  sgstAmount: Number,
  igstAmount: Number,
  
  // Final totals
  finalTotal: Number,
  
  // SO Number generation
  soNumberType: { 
    type: String, 
    enum: ['internal', 'external'], 
    default: 'internal' 
  },
  customSONumber: String, // For external SO numbers
  
  // Status and workflow
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'rejected', 'completed'], 
    default: 'draft' 
  },
  
  // Audit fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, { timestamps: true });

// Indexes for better performance
SalesOrderSchema.index({ soNumber: 1 });
SalesOrderSchema.index({ customerName: 1 });
SalesOrderSchema.index({ companyId: 1,  });
SalesOrderSchema.index({ date: 1 });
SalesOrderSchema.index({ status: 1 });
SalesOrderSchema.index({ isDeleted: 1 });

// Virtual for formatted date
SalesOrderSchema.virtual('formattedDate').get(function() {
  return this.date ? new Date(this.date).toLocaleDateString() : '';
});

// Pre-save middleware to calculate totals
SalesOrderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate aggregated totals from items
    this.total = this.items.reduce((sum, item) => sum + (item.itemSubtotal || 0), 0);
    this.cgstAmount = this.items.reduce((sum, item) => sum + (item.cgstAmount || 0), 0);
    this.sgstAmount = this.items.reduce((sum, item) => sum + (item.sgstAmount || 0), 0);
    this.igstAmount = this.items.reduce((sum, item) => sum + (item.igstAmount || 0), 0);
    this.finalTotal = this.items.reduce((sum, item) => sum + (item.itemTotalWithTax || 0), 0);
  }
  next();
});

module.exports = mongoose.model('SalesOrder', SalesOrderSchema);