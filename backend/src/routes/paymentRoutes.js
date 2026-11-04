const express = require('express');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(paymentController.getAllPayments);

router.route('/:id')
  .get(paymentController.getPaymentById);

router.patch('/:id/refund', authorizeRoles('organizer', 'admin'), paymentController.refundPayment);

module.exports = router;

