const express = require('express');
const eventController = require('../controllers/eventController');
const { createEventValidator, updateEventValidator } = require('../validators/eventValidators');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.route('/')
  .get(optionalAuth, eventController.getAllEvents)
  .post(auth, authorizeRoles('organizer', 'admin'), createEventValidator, validate, eventController.createEvent);

router.route('/:id')
  .get(optionalAuth, eventController.getEventById)
  .patch(auth, authorizeRoles('organizer', 'admin'), updateEventValidator, validate, eventController.updateEvent)
  .delete(auth, authorizeRoles('organizer', 'admin'), eventController.deleteEvent);

module.exports = router;
