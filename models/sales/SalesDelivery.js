const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  orderedQuantity: Number,
  deliveredQuantity: Number,
  pendingQuantity: Number,
  baseUnit: String,
  unit: String,
  orderUnit: String,
  price: Number,
  priceUnit: String,
  deliveryDate: String,
  actualDeliveryDate: String,
  note: String,
  isPartialDelivery: { type: Boolean, default: false },
});

const SalesDeliverySchema = new mongoose.Schema({
  deliveryNumber: String,
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' },
  soNumber: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrderCategory' },
  category: String,
  deliveryDate: String,
  actualDeliveryDate: String,
  customerName: String,
  contactPerson: String,
  salesGroup: String,
  deliveryLocation: String,
  deliveryAddress: String,
  transportDetails: String,
  vehicleNumber: String,
  driverName: String,
  driverPhone: String,
  items: [ItemSchema],
  deliveryType: { type: String, enum: ['Full', 'Partial'], default: 'Full' },
  deliveryStatus: { type: String, enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'], default: 'Pending' },
  total: Number,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  financialYear: String,
  selectedConditions: [],
  remarks: String,
  deliveryNumberType: { type: String, enum: ['internal', 'external'], default: 'internal' },
  customDeliveryNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('SalesDelivery', SalesDeliverySchema);