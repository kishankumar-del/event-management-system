const express = require('express');
const venueController = require('../controllers/venueController');
const { createVenueValidator, updateVenueValidator } = require('../validators/venueValidators');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.route('/')
  .get(venueController.getAllVenues)
  .post(auth, authorizeRoles('organizer', 'admin'), createVenueValidator, validate, venueController.createVenue);

router.route('/:id')
  .get(venueController.getVenueById)
  .patch(auth, authorizeRoles('organizer', 'admin'), updateVenueValidator, validate, venueController.updateVenue)
  .delete(auth, authorizeRoles('organizer', 'admin'), venueController.deleteVenue);

module.exports = router;
