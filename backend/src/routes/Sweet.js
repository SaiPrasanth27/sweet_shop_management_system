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
  const { category, search } = req.query;
  let query = {};

  if (category) query.category = category;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const sweets = await Sweet.find(query);
  res.status(200).json({ sweets });
});

/**
 * POST /api/Sweet (ADMIN ONLY)
 */
router.post(
  '/',
  authenticateToken,   // ✅ MUST COME FIRST
  requireAdmin,        // ✅ MUST COME SECOND
  uploadSingle,
  validateSweetCreation,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Image required' });
    }

    const sweet = await Sweet.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      imageFilename: req.file.filename
    });

    res.status(201).json({ sweet });
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
    const sweet = await Sweet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.status(200).json({ sweet });
  }
);

/**
 * DELETE /api/Sweet/:id (ADMIN ONLY)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const sweet = await Sweet.findByIdAndDelete(req.params.id);

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.status(200).json({ message: 'Deleted' });
  }
);

module.exports = router;
