const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

/**
 * List ticket types (optionally filtered by event ID in query or param)
 */
const getAllTicketTypes = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  if (req.params.eventId) {
    queryObj.event = req.params.eventId;
  }

  const countQuery = new APIFeatures(TicketType.find(), queryObj).filter();
  const total = await countQuery.query.countDocuments();

  const features = new APIFeatures(TicketType.find(), queryObj)
    .filter()
    .sort('price')
    .paginate();

  const ticketTypes = await features.query.populate('event', 'title status startDate capacity');

  res.status(200).json({
    data: ticketTypes,
    page: features.paginationMeta.page,
    limit: features.paginationMeta.limit,
    total,
    totalPages: Math.ceil(total / features.paginationMeta.limit) || 1,
  });
});

/**
 * Get ticket type by ID
 */
const getTicketTypeById = catchAsync(async (req, res, next) => {
  const ticketType = await TicketType.findById(req.params.id).populate(
    'event',
    'title status startDate capacity'
  );
  if (!ticketType) {
    return next(new AppError('No ticket tier found with that ID.', 404));
  }

  res.status(200).json({
    data: ticketType,
  });
});

/**
 * Organizer / Admin: Create ticket tier
 */
const createTicketType = catchAsync(async (req, res, next) => {
  const { event: eventId, name, price, quantityTotal, saleStart, saleEnd } = req.body;

  const eventDoc = await Event.findById(eventId);
  if (!eventDoc) {
    return next(new AppError('Referenced event does not exist.', 400));
  }

  // Ownership check
  if (req.user.role !== 'admin' && eventDoc.organizer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to create ticket tiers for this event.', 403));
  }

  // Check sum of ticket quantities against event capacity
  const existingTiers = await TicketType.find({ event: eventId });
  const currentTotal = existingTiers.reduce((acc, t) => acc + t.quantityTotal, 0);
  if (currentTotal + Number(quantityTotal) > eventDoc.capacity) {
    return next(
      new AppError(
        `Total tickets across tiers (${currentTotal + Number(quantityTotal)}) would exceed event capacity (${eventDoc.capacity}).`,
        400
      )
    );
  }

  const newTicket = await TicketType.create({
    event: eventId,
    name,
    price,
    quantityTotal,
    quantitySold: 0,
    saleStart,
    saleEnd,
  });

  res.status(201).json({
    data: newTicket,
  });
});

/**
 * Organizer / Admin: Update ticket tier
 */
const updateTicketType = catchAsync(async (req, res, next) => {
  const ticketType = await TicketType.findById(req.params.id);
  if (!ticketType) {
    return next(new AppError('No ticket tier found with that ID.', 404));
  }

  const eventDoc = await Event.findById(ticketType.event);
  if (req.user.role !== 'admin' && eventDoc.organizer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this ticket tier.', 403));
  }

  // Prevent reducing quantityTotal below already sold quantity
  if (req.body.quantityTotal !== undefined && Number(req.body.quantityTotal) < ticketType.quantitySold) {
    return next(
      new AppError(
        `Cannot reduce total quantity to ${req.body.quantityTotal}; ${ticketType.quantitySold} tickets have already been sold.`,
        400
      )
    );
  }

  const updatedTicket = await TicketType.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    data: updatedTicket,
  });
});

/**
 * Organizer / Admin: Delete ticket tier
 */
const deleteTicketType = catchAsync(async (req, res, next) => {
  const ticketType = await TicketType.findById(req.params.id);
  if (!ticketType) {
    return next(new AppError('No ticket tier found with that ID.', 404));
  }

  const eventDoc = await Event.findById(ticketType.event);
  if (req.user.role !== 'admin' && eventDoc.organizer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to delete this ticket tier.', 403));
  }

  // Guard: cannot delete if tickets have been sold
  if (ticketType.quantitySold > 0) {
    return next(
      new AppError(
        `Cannot delete ticket tier: ${ticketType.quantitySold} ticket(s) have already been sold.`,
        400
      )
    );
  }

  await TicketType.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Ticket tier deleted successfully.',
  });
});

module.exports = {
  getAllTicketTypes,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType,
};
