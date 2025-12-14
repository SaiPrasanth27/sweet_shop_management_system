const express = require('express');
const router = express.Router();
const Sweet = require('../models/Sweet');

router.get('/', async (req, res) => {
  const sweets = await Sweet.find();
  res.status(200).json({ sweets });
});

module.exports = router;
