const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const registrationService = require('../services/registrationService');

/**
 * Register tickets for an event (Attendee, Organizer, Admin)
 */
const createRegistration = catchAsync(async (req, res) => {
  const { eventId, ticketTypeId, quantity, paymentMethod } = req.body;

  const result = await registrationService.createRegistrationWithPayment({
    userId: req.user._id,
    eventId,
    ticketTypeId,
    quantity: Number(quantity) || 1,
    paymentMethod,
  });

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

/**
 * List registrations scoped by role
 */
const getRegistrations = catchAsync(async (req, res) => {
  const queryObj = { ...req.query };

  // Role Scoping
  if (req.user.role === 'attendee') {
    queryObj.user = req.user._id;
  } else if (req.user.role === 'organizer') {
    // If not already filtering by a specific event they own
    if (queryObj.event) {
      // Verify they own the event
      const event = await Event.findOne({ _id: queryObj.event, organizer: req.user._id });
      if (!event) {
        return res.status(200).json({ data: [], page: 1, limit: 10, total: 0, totalPages: 0 });
      }
    } else {
      const myEvents = await Event.find({ organizer: req.user._id }).select('_id');
      const eventIds = myEvents.map((e) => e._id);
      queryObj.event = { $in: eventIds };
    }
  }
  // Admin sees everything without restriction

  const countQuery = new APIFeatures(Registration.find(), queryObj)
    .search(['registrationCode'])
    .filter();
  const total = await countQuery.query.countDocuments();

  const features = new APIFeatures(Registration.find(), queryObj)
    .search(['registrationCode'])
    .filter()
    .sort('-createdAt')
    .paginate();

  const registrations = await features.query
    .populate({
      path: 'event',
      select: 'title startDate endDate venue category status',
      populate: { path: 'venue', select: 'name city address' },
    })
    .populate('ticketType', 'name price')
    .populate('user', 'name email');

  res.status(200).json({
    data: registrations,
    page: features.paginationMeta.page,
    limit: features.paginationMeta.limit,
    total,
    totalPages: Math.ceil(total / features.paginationMeta.limit) || 1,
  });
});

/**
 * Get registration details (including payment info for Stub rendering)
 */
const getRegistrationById = catchAsync(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id)
    .populate({
      path: 'event',
      select: 'title description startDate endDate venue category status organizer',
      populate: { path: 'venue', select: 'name city address capacity' },
    })
    .populate('ticketType', 'name price')
    .populate('user', 'name email');

  if (!registration) {
    return next(new AppError('No registration found with that ID.', 404));
  }

  // Permission check
  const isOwner = registration.user._id.toString() === req.user._id.toString();
  const isOrganizer =
    req.user.role === 'organizer' &&
    registration.event.organizer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isOrganizer && !isAdmin) {
    return next(new AppError('You are not authorized to view this registration.', 403));
  }

  // Fetch linked payment
  const payment = await Payment.findOne({ registration: registration._id });

  res.status(200).json({
    data: {
      ...registration.toObject(),
      payment,
    },
  });
});

/**
 * Cancel a registration and restore ticket inventory
 */
const cancelRegistration = catchAsync(async (req, res) => {
  const registration = await registrationService.cancelRegistration(req.params.id, req.user);

  res.status(200).json({
    status: 'success',
    message: 'Registration cancelled successfully and inventory restored.',
    data: registration,
  });
});

/**
 * Attendance check-in action (Organizer / Admin)
 */
const checkInRegistration = catchAsync(async (req, res) => {
  const { attendance } = req.body;
  const registration = await registrationService.checkInRegistration(
    req.params.id,
    attendance || 'checked_in',
    req.user
  );

  res.status(200).json({
    status: 'success',
    message: `Attendance updated to '${attendance || 'checked_in'}'.`,
    data: registration,
  });
});

module.exports = {
  createRegistration,
  getRegistrations,
  getRegistrationById,
  cancelRegistration,
  checkInRegistration,
};
