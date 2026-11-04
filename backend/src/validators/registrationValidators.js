const { body } = require('express-validator');

const createRegistrationValidator = [
  body('eventId')
    .notEmpty()
    .withMessage('Event ID is required.')
    .isMongoId()
    .withMessage('Invalid event ID format.'),
  body('ticketTypeId')
    .notEmpty()
    .withMessage('Ticket type ID is required.')
    .isMongoId()
    .withMessage('Invalid ticket type ID format.'),
  body('quantity')
    .notEmpty()
    .withMessage('Ticket quantity is required.')
    .isInt({ min: 1, max: 10 })
    .withMessage('You can register between 1 and 10 tickets per order.'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required.')
    .isIn(['card', 'upi', 'cash'])
    .withMessage('Payment method must be card, upi, or cash.'),
];

const checkInValidator = [
  body('attendance')
    .notEmpty()
    .withMessage('Attendance status is required.')
    .isIn(['checked_in', 'no_show', 'pending'])
    .withMessage('Attendance must be checked_in, no_show, or pending.'),
];

module.exports = {
  createRegistrationValidator,
  checkInValidator,
};
