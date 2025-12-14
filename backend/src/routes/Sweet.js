const express = require('express');
const router = express.Router();
const Sweet = require('../models/Sweet');

router.get('/', async (req, res) => {

const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  const sweets = await Sweet.find(filter);
  res.status(200).json({ sweets });
});

router.get('/:id', async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);
  if (!sweet) {
    return res.status(404).json({ error: 'Sweet not found' });
  }
  res.json(sweet);
});

module.exports = router;
