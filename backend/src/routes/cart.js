const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const Sweet = require('../models/Sweet');
const User = require('../models/User');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('cart.sweet');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cartItems = user.cart || [];
    const totalAmount = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.json({
      cart: { items: cartItems },
      totalAmount,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { sweetId, quantity = 1 } = req.body;

    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const user = await User.findById(req.user.userId);
    if (!user.cart) {
      user.cart = [];
    }

    // Check if item already in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.sweet.toString() === sweetId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      if (sweet.quantity < newQuantity) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.push({
        sweet: sweetId,
        quantity,
        price: sweet.price
      });
    }

    await user.save();
    await user.populate('cart.sweet');

    const totalAmount = user.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.json({
      message: 'Item added to cart',
      cart: { items: user.cart },
      totalAmount,
      itemCount: user.cart.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { sweetId, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const sweet = await Sweet.findById(sweetId);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const user = await User.findById(req.user.userId);
    const itemIndex = user.cart.findIndex(
      item => item.sweet.toString() === sweetId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();
    await user.populate('cart.sweet');

    const totalAmount = user.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.json({
      message: 'Cart updated',
      cart: { items: user.cart },
      totalAmount,
      itemCount: user.cart.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove/:sweetId', authenticateToken, async (req, res) => {
  try {
    const { sweetId } = req.params;

    const user = await User.findById(req.user.userId);
    user.cart = user.cart.filter(
      item => item.sweet.toString() !== sweetId
    );

    await user.save();
    await user.populate('cart.sweet');

    const totalAmount = user.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    res.json({
      message: 'Item removed from cart',
      cart: { items: user.cart },
      totalAmount,
      itemCount: user.cart.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.cart = [];
    await user.save();

    res.json({
      message: 'Cart cleared',
      cart: { items: [] },
      totalAmount: 0,
      itemCount: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;