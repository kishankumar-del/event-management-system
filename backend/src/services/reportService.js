const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const TicketType = require('../models/TicketType');
const User = require('../models/User');

/**
 * Aggregates organizer event performance metrics:
 * 1. Revenue per event
 * 2. Registrations & tickets sold per event
 * 3. Attendance check-in rate breakdown
 * 4. Ticket tier sales breakdown
 */
const getOrganizerReports = async (organizerId) => {
  const orgObjectId = new mongoose.Types.ObjectId(organizerId);

  // 1. Fetch organizer's events
  const organizerEvents = await Event.find({ organizer: orgObjectId }).select(
    '_id title category status capacity startDate'
  );
  const eventIds = organizerEvents.map((e) => e._id);

  if (eventIds.length === 0) {
    return {
      kpis: {
        totalEvents: 0,
        totalRegistrations: 0,
        totalRevenue: 0,
        attendanceRate: 0,
      },
      revenueByEvent: [],
      attendanceBreakdown: { checked_in: 0, pending: 0, no_show: 0 },
      ticketTierSales: [],
      events: [],
    };
  }

  // 2. Revenue and Registration counts per event
  const revenueByEvent = await Registration.aggregate([
    {
      $match: {
        event: { $in: eventIds },
        status: 'confirmed',
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'registration',
        as: 'payment',
      },
    },
    {
      $unwind: {
        path: '$payment',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: '$event',
        totalTickets: { $sum: '$quantity' },
        totalBookings: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $cond: [{ $eq: ['$payment.status', 'paid'] }, '$payment.amount', 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'eventInfo',
      },
    },
    {
      $unwind: '$eventInfo',
    },
    {
      $project: {
        eventId: '$_id',
        title: '$eventInfo.title',
        category: '$eventInfo.category',
        capacity: '$eventInfo.capacity',
        totalTickets: 1,
        totalBookings: 1,
        totalRevenue: 1,
      },
    },
    {
      $sort: { totalRevenue: -1 },
    },
  ]);

  // 3. Attendance rate breakdown across organizer's events
  const attendanceAgg = await Registration.aggregate([
    {
      $match: {
        event: { $in: eventIds },
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: '$attendance',
        count: { $sum: '$quantity' },
      },
    },
  ]);

  const attendanceBreakdown = {
    checked_in: 0,
    pending: 0,
    no_show: 0,
  };
  let totalConfirmedTickets = 0;

  attendanceAgg.forEach((item) => {
    if (attendanceBreakdown[item._id] !== undefined) {
      attendanceBreakdown[item._id] = item.count;
    }
    totalConfirmedTickets += item.count;
  });

  const attendanceRate = totalConfirmedTickets > 0
    ? Math.round((attendanceBreakdown.checked_in / totalConfirmedTickets) * 100)
    : 0;

  // 4. Ticket tier sales distribution
  const ticketTierSales = await TicketType.aggregate([
    {
      $match: {
        event: { $in: eventIds },
      },
    },
    {
      $lookup: {
        from: 'events',
        localField: 'event',
        foreignField: '_id',
        as: 'eventInfo',
      },
    },
    {
      $unwind: '$eventInfo',
    },
    {
      $project: {
        tierName: '$name',
        eventTitle: '$eventInfo.title',
        price: '$price',
        quantityTotal: '$quantityTotal',
        quantitySold: '$quantitySold',
        percentSold: {
          $cond: [
            { $gt: ['$quantityTotal', 0] },
            { $round: [{ $multiply: [{ $divide: ['$quantitySold', '$quantityTotal'] }, 100] }, 1] },
            0,
          ],
        },
      },
    },
    {
      $sort: { percentSold: -1 },
    },
  ]);

  // Overall KPIs
  const totalRevenue = revenueByEvent.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalBookings = revenueByEvent.reduce((acc, curr) => acc + curr.totalBookings, 0);

  return {
    kpis: {
      totalEvents: organizerEvents.length,
      totalRegistrations: totalBookings,
      totalTicketsSold: totalConfirmedTickets,
      totalRevenue,
      attendanceRate,
    },
    revenueByEvent,
    attendanceBreakdown,
    ticketTierSales,
    events: organizerEvents,
  };
};

/**
 * Aggregates global platform metrics for administrators
 */
const getAdminReports = async () => {
  // 1. Total counts
  const totalUsers = await User.countDocuments();
  const totalEvents = await Event.countDocuments();
  const totalRegistrations = await Registration.countDocuments({ status: 'confirmed' });

  // 2. Total platform revenue
  const revenueAgg = await Payment.aggregate([
    { $match: { status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // 3. User distribution by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  // 4. Events distribution by category
  const eventsByCategory = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // 5. Top 5 Revenue generating events
  const topEvents = await Registration.aggregate([
    { $match: { status: 'confirmed' } },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'registration',
        as: 'payment',
      },
    },
    { $unwind: '$payment' },
    { $match: { 'payment.status': 'paid' } },
    {
      $group: {
        _id: '$event',
        totalRevenue: { $sum: '$payment.amount' },
        ticketsSold: { $sum: '$quantity' },
      },
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event',
      },
    },
    { $unwind: '$event' },
    {
      $project: {
        title: '$event.title',
        category: '$event.category',
        totalRevenue: 1,
        ticketsSold: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);

  // 6. Global attendance rate
  const attendanceAgg = await Registration.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$attendance', count: { $sum: '$quantity' } } },
  ]);

  const attendanceBreakdown = { checked_in: 0, pending: 0, no_show: 0 };
  let totalTickets = 0;
  attendanceAgg.forEach((a) => {
    if (attendanceBreakdown[a._id] !== undefined) attendanceBreakdown[a._id] = a.count;
    totalTickets += a.count;
  });

  const attendanceRate = totalTickets > 0
    ? Math.round((attendanceBreakdown.checked_in / totalTickets) * 100)
    : 0;

  return {
    kpis: {
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalTicketsSold: totalTickets,
      totalRevenue,
      attendanceRate,
    },
    topEvents,
    eventsByCategory,
    usersByRole,
    attendanceBreakdown,
  };
};

module.exports = {
  getOrganizerReports,
  getAdminReports,
};

