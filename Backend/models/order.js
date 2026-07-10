const mongoose = require('mongoose');

const orderedItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: { type: String, required: true }, // snapshot of name at order time
    price: { type: Number, required: true }, // snapshot of price at order time
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
    },
    orderedItems: {
      type: [orderedItemSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // NOTE: merged with the customer-facing status names (Pending / Preparing / Ready)
    // requested in the feature spec, plus a final "Completed" state for archiving.
    orderStatus: {
      type: String,
      enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

orderSchema.index({ tableNumber: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);