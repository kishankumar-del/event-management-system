const Event = require('../models/Event');
const Venue = require('../models/Venue');
const TicketType = require('../models/TicketType');
const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

/**
 * Public & Auth: List events with search, category/city/status filters, sort & pagination
 */
const getAllEvents = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };

  // If unauthenticated or attendee, only show published events unless explicit
  if (!req.user || req.user.role === 'attendee') {
    queryObj.status = 'published';
  } else if (req.user.role === 'organizer' && !queryObj.organizer) {
    // If organizer hasn't filtered by specific organizer, show either published or their own
    if (!queryObj.status) {
      // By default show published plus organizer's own drafts
      queryObj.$or = [{ status: 'published' }, { organizer: req.user._id }];
    }
  }

  // Handle city filter via venue lookup
  if (queryObj.city) {
    const venuesInCity = await Venue.find({
      city: { $regex: queryObj.city, $options: 'i' },
    }).select('_id');
    const venueIds = venuesInCity.map((v) => v._id);
    queryObj.venue = { $in: venueIds };
    delete queryObj.city;
  }

  const countQuery = new APIFeatures(Event.find(), queryObj)
    .search(['title', 'description'])
    .filter();
  const total = await countQuery.query.countDocuments();

  const features = new APIFeatures(Event.find(), queryObj)
    .search(['title', 'description'])
    .filter()
    .sort('startDate')
    .paginate();

  const events = await features.query
    .populate('venue', 'name address city capacity')
    .populate('organizer', 'name email');

  res.status(200).json({
    data: events,
    page: features.paginationMeta.page,
    limit: features.paginationMeta.limit,
    total,
    totalPages: Math.ceil(total / features.paginationMeta.limit) || 1,
  });
});

/**
 * Public & Auth: Get single event by ID with venue, organizer, and active ticket types
 */
const getEventById = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('venue', 'name address city capacity')
    .populate('organizer', 'name email');

  if (!event) {
    return next(new AppError('No event found with that ID.', 404));
  }

  // Fetch ticket types for this event
  const ticketTypes = await TicketType.find({ event: event._id }).sort('price');

  res.status(200).json({
    data: {
      ...event.toObject(),
      ticketTypes,
    },
  });
});

/**
 * Organizer / Admin: Create new event
 */
const createEvent = catchAsync(async (req, res, next) => {
  const { title, description, category, startDate, endDate, venue, capacity, status } = req.body;

  // Verify venue exists
  const venueDoc = await Venue.findById(venue);
  if (!venueDoc) {
    return next(new AppError('Selected venue does not exist.', 400));
  }

  // Guard: Event capacity cannot exceed venue capacity
  if (Number(capacity) > venueDoc.capacity) {
    return next(
      new AppError(
        `Event capacity (${capacity}) cannot exceed venue capacity (${venueDoc.capacity}).`,
        400
      )
    );
  }

  const newEvent = await Event.create({
    title,
    description,
    category,
    startDate,
    endDate,
    venue,
    organizer: req.user._id,
    capacity,
    status: status || 'draft',
  });

  res.status(201).json({
    data: newEvent,
  });
});

/**
 * Organizer (Owner) / Admin: Update event
 */
const updateEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new AppError('No event found with that ID.', 404));
  }

  // Check ownership
  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this event.', 403));
  }

  // Check venue capacity constraint if venue or capacity modified
  if (req.body.venue || req.body.capacity) {
    const venueId = req.body.venue || event.venue;
    const venueDoc = await Venue.findById(venueId);
    const targetCapacity = req.body.capacity !== undefined ? Number(req.body.capacity) : event.capacity;
    if (venueDoc && targetCapacity > venueDoc.capacity) {
      return next(
        new AppError(
          `Event capacity (${targetCapacity}) cannot exceed venue capacity (${venueDoc.capacity}).`,
          400
        )
      );
    }
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('venue', 'name address city capacity')
    .populate('organizer', 'name email');

  res.status(200).json({
    data: updatedEvent,
  });
});

/**
 * Organizer (Owner) / Admin: Delete or cancel event
 */
const deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return next(new AppError('No event found with that ID.', 404));
  }

  if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to delete this event.', 403));
  }

  // If there are existing registrations, set status to cancelled instead of deleting
  const registrationCount = await Registration.countDocuments({
    event: event._id,
    status: 'confirmed',
  });

  if (registrationCount > 0) {
    event.status = 'cancelled';
    await event.save();
    return res.status(200).json({
      status: 'success',
      message: `Event has ${registrationCount} confirmed registrations; marked as cancelled instead of hard delete.`,
      data: event,
    });
  }

  // Clean up ticket types if no registrations exist
  await TicketType.deleteMany({ event: event._id });
  await Event.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Event and associated ticket tiers deleted successfully.',
  });
});

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

