const express = require('express');
const Sweet = require('../models/Sweet');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');
const {
  validateSweetCreation,
  validateSweetUpdate,
  validateSweetQuery
} = require('../middlewares/sweetValidation');

const router = express.Router();

/**
 * GET /api/Sweet
 */
router.get('/', validateSweetQuery, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    let query = {};

    if (category) query.category = category;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sweets = await Sweet.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Sweet.countDocuments(query);

    res.status(200).json({ 
      sweets,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({ error: 'Failed to fetch sweets' });
  }
});

/**
 * GET /api/Sweet/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }
    res.status(200).json({ sweet });
  } catch (error) {
    console.error('Get sweet error:', error);
    res.status(500).json({ error: 'Failed to fetch sweet' });
  }
});

/**
 * POST /api/Sweet (ADMIN ONLY)
 */
router.post(
  '/',
  authenticateToken,   // ✅ MUST COME FIRST
  requireAdmin,        // ✅ MUST COME SECOND
  validateSweetCreation,
  async (req, res) => {
    try {
      const sweetData = {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        category: req.body.category,
        quantity: parseInt(req.body.quantity) || 0
      };

      // Add image URL if provided
      if (req.body.imageUrl) {
        sweetData.imageUrl = req.body.imageUrl;
      }

      const sweet = await Sweet.create(sweetData);
      res.status(201).json({ 
        message: 'Sweet created successfully',
        sweet 
      });
    } catch (error) {
      console.error('Create sweet error:', error);
      res.status(500).json({ error: 'Failed to create sweet' });
    }
  }
);

/**
 * PUT /api/Sweet/:id (ADMIN ONLY)
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  validateSweetUpdate,
  async (req, res) => {
    try {
      const updateData = {};
      
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.price) updateData.price = parseFloat(req.body.price);
      if (req.body.category) updateData.category = req.body.category;
      if (req.body.quantity) updateData.quantity = parseInt(req.body.quantity);

      // Add image URL if provided
      if (req.body.imageUrl) {
        updateData.imageUrl = req.body.imageUrl;
      }

      const sweet = await Sweet.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!sweet) {
        return res.status(404).json({ error: 'Sweet not found' });
      }

      res.status(200).json({ 
        message: 'Sweet updated successfully',
        sweet 
      });
    } catch (error) {
      console.error('Update sweet error:', error);
      res.status(500).json({ error: 'Failed to update sweet' });
    }
  }
);

/**
 * POST /api/Sweet/:id/restock (ADMIN ONLY)
 */
router.post('/:id/restock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    sweet.quantity += parseInt(quantity);
    await sweet.save();

    res.status(200).json({ 
      message: 'Sweet restocked successfully',
      sweet,
      newQuantity: sweet.quantity
    });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({ error: 'Failed to restock sweet' });
  }
});

/**
 * POST /api/Sweet/:id/purchase (CUSTOMER)
 */
router.post('/:id/purchase', authenticateToken, async (req, res) => {
  try {
    const { quantity = 1, notes = '' } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }

    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    // Create order
    const Order = require('../models/Order');
    const totalAmount = sweet.price * quantity;
    const orderNumber = await Order.generateOrderNumber();
    
    const order = new Order({
      user: req.user.userId,
      items: [{
        sweet: sweet._id,
        name: sweet.name,
        price: sweet.price,
        quantity: quantity
      }],
      totalAmount,
      orderNumber,
      totalItems: quantity,
      status: 'ordered'
    });

    await order.save();

    // Reduce stock
    sweet.quantity -= quantity;
    await sweet.save();

    res.status(200).json({ 
      message: 'Purchase successful',
      order: {
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      },
      sweet,
      purchasedQuantity: quantity
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

/**
 * DELETE /api/Sweet/:id (ADMIN ONLY)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const sweet = await Sweet.findByIdAndDelete(req.params.id);

      if (!sweet) {
        return res.status(404).json({ error: 'Sweet not found' });
      }

      res.status(200).json({ message: 'Sweet deleted successfully' });
    } catch (error) {
      console.error('Delete sweet error:', error);
      res.status(500).json({ error: 'Failed to delete sweet' });
    }
  }
);

module.exports = router;
