const { body, query, validationResult } = require('express-validator');

// Reuse same error handler pattern
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// ✅ Validate Sweet creation
const validateSweetCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('category')
    .isIn(['Chocolate', 'Gummy', 'Hard Candy', 'Cookies', 'Cakes', 'Other'])
    .withMessage('Invalid category'),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),

  handleValidationErrors
];

// ✅ Validate Sweet update
const validateSweetUpdate = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('category')
    .optional()
    .isIn(['Chocolate', 'Gummy', 'Hard Candy', 'Cookies', 'Cakes', 'Other']),
  body('quantity').optional().isInt({ min: 0 }),

  handleValidationErrors
];

// ✅ Validate query params (GET)
const validateSweetQuery = [
  query('category')
    .optional()
    .isIn(['Chocolate', 'Gummy', 'Hard Candy', 'Cookies', 'Cakes', 'Other']),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 }),

  handleValidationErrors
];

module.exports = {
  validateSweetCreation,
  validateSweetUpdate,
  validateSweetQuery
};
