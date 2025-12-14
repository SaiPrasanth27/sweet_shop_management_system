const mongoose = require('mongoose');

// Order Item Subschema
const orderItemSchema = new mongoose.Schema({
  sweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sweet',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

// Order Schema and Model  
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  totalItems: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['ordered', 'received', 'cancelled'],
    default: 'ordered'
  }
}, {
  timestamps: true
});

// Index for performance
orderSchema.index({ user: 1, createdAt: -1 });
// orderNumber already has an index from unique: true constraint

// Static method to generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const count = await this.countDocuments();
  return `ORD-${String(count + 1).padStart(6, '0')}`;
};

// Static method to calculate user's total spent (excluding cancelled orders)
orderSchema.statics.calculateUserTotalSpent = async function(userId) {
  const result = await this.aggregate([
    {
      $match: {
        user: userId,
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$totalAmount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalSpent : 0;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;