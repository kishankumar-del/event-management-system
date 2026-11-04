const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const { sanitizeUser } = require('../services/authService');

/**
 * Admin: Get all users (paginated, searchable, filterable)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  const countQuery = new APIFeatures(User.find(), req.query)
    .search(['name', 'email'])
    .filter();
  const total = await countQuery.query.countDocuments();

  const features = new APIFeatures(User.find(), req.query)
    .search(['name', 'email'])
    .filter()
    .sort('-createdAt')
    .paginate();

  const users = await features.query;

  res.status(200).json({
    data: users.map(sanitizeUser),
    page: features.paginationMeta.page,
    limit: features.paginationMeta.limit,
    total,
    totalPages: Math.ceil(total / features.paginationMeta.limit) || 1,
  });
});

/**
 * Admin: Get single user by ID
 */
const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID.', 404));
  }

  res.status(200).json({
    data: sanitizeUser(user),
  });
});

/**
 * Admin: Update user role or active status
 */
const updateUser = catchAsync(async (req, res, next) => {
  const { role, isActive } = req.body;
  const updates = {};
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with that ID.', 404));
  }

  res.status(200).json({
    data: sanitizeUser(user),
  });
});

/**
 * Admin: Deactivate user
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) {
    return next(new AppError('No user found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully.',
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

