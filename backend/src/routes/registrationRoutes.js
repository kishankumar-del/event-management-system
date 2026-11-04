const express = require('express');
const registrationController = require('../controllers/registrationController');
const {
  createRegistrationValidator,
  checkInValidator,
} = require('../validators/registrationValidators');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(registrationController.getRegistrations)
  .post(createRegistrationValidator, validate, registrationController.createRegistration);

router.route('/:id')
  .get(registrationController.getRegistrationById);

router.patch('/:id/cancel', registrationController.cancelRegistration);

router.patch(
  '/:id/check-in',
  authorizeRoles('organizer', 'admin'),
  checkInValidator,
  validate,
  registrationController.checkInRegistration
);

module.exports = router;

