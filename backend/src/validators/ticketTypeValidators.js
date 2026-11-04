const { body } = require('express-validator');

const createTicketTypeValidator = [
  body('event')
    .notEmpty()
    .withMessage('Event ID is required.')
    .isMongoId()
    .withMessage('Invalid event ID format.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Ticket tier name is required.')
    .isLength({ max: 80 })
    .withMessage('Tier name cannot exceed 80 characters.'),
  body('price')
    .notEmpty()
    .withMessage('Ticket price is required.')
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be greater than or equal to 0.'),
  body('quantityTotal')
    .notEmpty()
    .withMessage('Total quantity is required.')
    .isInt({ min: 1 })
    .withMessage('Total quantity must be at least 1.'),
  body('saleStart')
    .notEmpty()
    .withMessage('Sale start date is required.')
    .isISO8601()
    .withMessage('Sale start date must be a valid date.'),
  body('saleEnd')
    .notEmpty()
    .withMessage('Sale end date is required.')
    .isISO8601()
    .withMessage('Sale end date must be a valid date.')
    .custom((saleEnd, { req }) => {
      if (new Date(saleEnd) < new Date(req.body.saleStart)) {
        throw new Error('Sale end date must be greater than or equal to sale start date.');
      }
      return true;
    }),
];

const updateTicketTypeValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tier name cannot be empty.'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative.'),
  body('quantityTotal')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1.'),
  body('saleStart')
    .optional()
    .isISO8601(),
  body('saleEnd')
    .optional()
    .isISO8601()
    .custom((saleEnd, { req }) => {
      if (req.body.saleStart && new Date(saleEnd) < new Date(req.body.saleStart)) {
        throw new Error('Sale end date must be greater than or equal to sale start date.');
      }
      return true;
    }),
];

module.exports = {
  createTicketTypeValidator,
  updateTicketTypeValidator,
};

