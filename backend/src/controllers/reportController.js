const catchAsync = require('../utils/catchAsync');
const reportService = require('../services/reportService');

/**
 * Organizer reports: real MongoDB aggregates for their events
 */
const getOrganizerReport = catchAsync(async (req, res) => {
  const report = await reportService.getOrganizerReports(req.user._id);

  res.status(200).json({
    status: 'success',
    data: report,
  });
});

/**
 * Admin reports: platform-wide volume, revenue, and performance metrics
 */
const getAdminReport = catchAsync(async (req, res) => {
  const report = await reportService.getAdminReports();

  res.status(200).json({
    status: 'success',
    data: report,
  });
});

module.exports = {
  getOrganizerReport,
  getAdminReport,
};

