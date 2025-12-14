const express = require('express');
const Order = require('../models/Order');
const Sweet = require('../models/Sweet');
const { authenticateToken, requireAuth } = require('../middlewares/auth');

const router = express.Router();

// creating a new order (user only).
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }

    // Validate and calculate order details
    let totalAmount = 0;
    let totalItems = 0;
    const orderItems = [];

    for (const item of items) {
      const sweet = await Sweet.findById(item.sweet);
      if (!sweet) {
        return res.status(400).json({ error: `Sweet not found: ${item.sweet}` });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }

      if (sweet.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${sweet.name}. Available: ${sweet.stock}` 
        });
      }

      const itemTotal = sweet.price * item.quantity;
      totalAmount += itemTotal;
      totalItems += item.quantity;

      orderItems.push({
        sweet: sweet._id,
        name: sweet.name,
        price: sweet.price,
        quantity: item.quantity
      });

      // Update sweet stock
      sweet.stock -= item.quantity;
      await sweet.save();
    }

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      orderNumber,
      totalItems,
      status: 'ordered'
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

//fetching all orders of logged in user (user only).
router.get('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.sweet', 'name category');

    // Calculate total spent (excluding cancelled orders)
    const totalSpent = await Order.calculateUserTotalSpent(req.user.id);

    res.json({
      orders,
      totalSpent,
      count: orders.length
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// fetching details of a specific order (user only).
router.get('/:id', authenticateToken, requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('items.sweet', 'name category');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// update order status to 'cancelled' (user only)
// checks middleware for authentication and authorization.
router.put('/:id/cancel', authenticateToken, requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    if (order.status === 'received') {
      return res.status(400).json({ error: 'Cannot cancel received order' });
    }

    // Update order status and set amount to 0
    order.status = 'cancelled';
    order.totalAmount = 0;
    await order.save();

    // Restore stock for cancelled items
    for (const item of order.items) {
      const sweet = await Sweet.findById(item.sweet);
      if (sweet) {
        sweet.stock += item.quantity;
        await sweet.save();
      }
    }

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// to update order status (admin only)
//checks middleware for authentication and admin authorization.
router.put('/:id/status', authenticateToken, require('../middlewares/auth').requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ordered', 'received', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;