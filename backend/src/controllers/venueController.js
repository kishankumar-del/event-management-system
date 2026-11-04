const Venue = require('../models/Venue');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

/**
 * Public: List venues (paginated, searchable by name and city)
 */
const getAllVenues = catchAsync(async (req, res, next) => {
  const countQuery = new APIFeatures(Venue.find(), req.query)
    .search(['name', 'city'])
    .filter();
  const total = await countQuery.query.countDocuments();

  const features = new APIFeatures(Venue.find(), req.query)
    .search(['name', 'city'])
    .filter()
    .sort('name')
    .paginate();

  const venues = await features.query.populate('createdBy', 'name email');

  res.status(200).json({
    data: venues,
    page: features.paginationMeta.page,
    limit: features.paginationMeta.limit,
    total,
    totalPages: Math.ceil(total / features.paginationMeta.limit) || 1,
  });
});

/**
 * Public: Get single venue by ID
 */
const getVenueById = catchAsync(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id).populate('createdBy', 'name email');
  if (!venue) {
    return next(new AppError('No venue found with that ID.', 404));
  }

  res.status(200).json({
    data: venue,
  });
});

/**
 * Organizer / Admin: Create a new venue
 */
const createVenue = catchAsync(async (req, res, next) => {
  const { name, address, city, capacity } = req.body;

  const newVenue = await Venue.create({
    name,
    address,
    city,
    capacity,
    createdBy: req.user._id,
  });

  res.status(201).json({
    data: newVenue,
  });
});

/**
 * Organizer (Owner) / Admin: Update venue
 */
const updateVenue = catchAsync(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) {
    return next(new AppError('No venue found with that ID.', 404));
  }

  // Check ownership unless admin
  if (req.user.role !== 'admin' && venue.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this venue.', 403));
  }

  const { name, address, city, capacity } = req.body;
  if (name !== undefined) venue.name = name;
  if (address !== undefined) venue.address = address;
  if (city !== undefined) venue.city = city;
  if (capacity !== undefined) venue.capacity = capacity;

  await venue.save();

  res.status(200).json({
    data: venue,
  });
});

/**
 * Organizer (Owner) / Admin: Delete venue
 */
const deleteVenue = catchAsync(async (req, res, next) => {
  const venue = await Venue.findById(req.params.id);
  if (!venue) {
    return next(new AppError('No venue found with that ID.', 404));
  }

  // Check ownership unless admin
  if (req.user.role !== 'admin' && venue.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to delete this venue.', 403));
  }

  // Check if any events reference this venue
  const activeEvents = await Event.countDocuments({ venue: venue._id });
  if (activeEvents > 0) {
    return next(
      new AppError(`Cannot delete venue: ${activeEvents} event(s) are currently scheduled at this venue.`, 400)
    );
  }

  await Venue.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Venue deleted successfully.',
  });
});

module.exports = {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
};

