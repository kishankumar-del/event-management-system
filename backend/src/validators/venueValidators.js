const { body } = require('express-validator');

const createVenueValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Venue name is required.')
    .isLength({ max: 150 })
    .withMessage('Venue name cannot exceed 150 characters.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Street address is required.'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required.'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required.')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer of at least 1.'),
];

const updateVenueValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Venue name cannot be empty.')
    .isLength({ max: 150 }),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty.'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty.'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer.'),
];

module.exports = {
  createVenueValidator,
  updateVenueValidator,
};
