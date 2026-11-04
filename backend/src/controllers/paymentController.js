const Payment = require('../models/Payment');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const registrationService = require('../services/registrationService');

/**
 * List payments scoped by role
 */
const getAllPayments = catchAsync(async (req, res) => {
  const queryObj = { ...req.query };

  if (req.user.role === 'attendee') {
    // Find all registrations for this attendee
    const userRegs = await Registration.find({ user: req.user._id }).select('_id');
    const regIds = userRegs.map((r) => r._id);
    queryObj.registration = { $in: regIds };
  } else if (req.user.role === 'organizer') {
    // Find all events owned by organizer, then all registrations for those events
    const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
    const eventIds = myEvents.map((e) => e._id);
    const eventRegs = await Registration.find({ event: { $in: eventIds } }).select('_id');
    const regIds = eventRegs.map((r) => r._id);
    queryObj.registration = { $in: regIds };
  }

  const countQuery = new APIFeatures(Payment.find(), queryObj)
    .search(['reference'])
    .filter();
  const total = await countQuery.query.countDocuments();

  const features = new APIFeatures(Payment.find(), queryObj)
    .search(['reference'])
    .filter()
    .sort('-createdAt')
    .paginate();

  const payments = await features.query.populate({
    path: 'registration',
    select: 'registrationCode quantity status attendance user event ticketType',
    populate: [
      { path: 'user', select: 'name email' },
      { path: 'event', select: 'title startDate' },
      { path: 'ticketType', select: 'name price' },
    ],
  });

  res.status(200).json({
    data: payments,
    page: features.paginationMeta.page,
    limit: features.paginationMeta.limit,
    total,
    totalPages: Math.ceil(total / features.paginationMeta.limit) || 1,
  });
});

/**
 * Get payment receipt details
 */
const getPaymentById = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate({
    path: 'registration',
    populate: [
      { path: 'user', select: 'name email' },
      {
        path: 'event',
        select: 'title startDate endDate venue organizer',
        populate: { path: 'venue', select: 'name city address' },
      },
      { path: 'ticketType', select: 'name price' },
    ],
  });

  if (!payment) {
    return next(new AppError('No payment found with that ID.', 404));
  }

  // Ownership verification
  const reg = payment.registration;
  const isOwner = reg?.user?._id?.toString() === req.user._id.toString();
  const isOrganizer =
    req.user.role === 'organizer' &&
    reg?.event?.organizer?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isOrganizer && !isAdmin) {
    return next(new AppError('You are not authorized to view this payment.', 403));
  }

  res.status(200).json({
    data: payment,
  });
});

/**
 * Refund a payment (Admin / Organizer)
 */
const refundPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id).populate({
    path: 'registration',
    populate: { path: 'event' },
  });

  if (!payment) {
    return next(new AppError('No payment found with that ID.', 404));
  }

  const isOrganizer =
    req.user.role === 'organizer' &&
    payment.registration?.event?.organizer?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOrganizer && !isAdmin) {
    return next(new AppError('You do not have permission to refund this payment.', 403));
  }

  payment.status = 'refunded';
  await payment.save();

  // Cancel registration if still confirmed
  if (payment.registration && payment.registration.status === 'confirmed') {
    await registrationService.cancelRegistration(payment.registration._id, req.user);
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment refunded and registration cancelled.',
    data: payment,
  });
});

module.exports = {
  getAllPayments,
  getPaymentById,
  refundPayment,
};
