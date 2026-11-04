const { body } = require('express-validator');

const EVENT_CATEGORIES = [
  'Conference',
  'Concert',
  'Workshop',
  'Seminar',
  'Meetup',
  'Festival',
  'Exhibition',
  'Other',
];

const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required.')
    .isLength({ max: 200 })
    .withMessage('Event title cannot exceed 200 characters.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),
  body('category')
    .notEmpty()
    .withMessage('Category is required.')
    .isIn(EVENT_CATEGORIES)
    .withMessage(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required.')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date string.'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required.')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date string.')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be greater than or equal to start date.');
      }
      return true;
    }),
  body('venue')
    .notEmpty()
    .withMessage('Venue ID is required.')
    .isMongoId()
    .withMessage('Invalid venue ID format.'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required.')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1 person.'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Status must be draft, published, cancelled, or completed.'),
];

const updateEventValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty.')
    .isLength({ max: 200 }),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty.'),
  body('category')
    .optional()
    .isIn(EVENT_CATEGORIES)
    .withMessage(`Category must be one of: ${EVENT_CATEGORIES.join(', ')}`),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date.'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date.')
    .custom((endDate, { req }) => {
      if (req.body.startDate && new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be greater than or equal to start date.');
      }
      return true;
    }),
  body('venue')
    .optional()
    .isMongoId()
    .withMessage('Invalid venue ID format.'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1 person.'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Status must be draft, published, cancelled, or completed.'),
];

module.exports = {
  createEventValidator,
  updateEventValidator,
};

