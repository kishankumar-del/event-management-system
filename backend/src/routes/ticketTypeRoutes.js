const express = require('express');
const ticketTypeController = require('../controllers/ticketTypeController');
const {
  createTicketTypeValidator,
  updateTicketTypeValidator,
} = require('../validators/ticketTypeValidators');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router({ mergeParams: true });

router.route('/')
  .get(ticketTypeController.getAllTicketTypes)
  .post(
    auth,
    authorizeRoles('organizer', 'admin'),
    createTicketTypeValidator,
    validate,
    ticketTypeController.createTicketType
  );

router.route('/:id')
  .get(ticketTypeController.getTicketTypeById)
  .patch(
    auth,
    authorizeRoles('organizer', 'admin'),
    updateTicketTypeValidator,
    validate,
    ticketTypeController.updateTicketType
  )
  .delete(
    auth,
    authorizeRoles('organizer', 'admin'),
    ticketTypeController.deleteTicketType
  );

module.exports = router;
