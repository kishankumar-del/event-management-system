const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB } = require('../config/db');

// Import Models
const User = require('../models/User');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');

// Import Sample Data
const { sampleUsers, sampleVenues, getSampleEvents } = require('./seedData');

const seedDatabase = async () => {
  try {
    console.log('------------------------------------------------------------');
    console.log('[Seed] Starting database seeding process...');
    console.log(`[Seed] Target Database: ${env.MONGODB_URI.replace(/:[^:]*@/, ':****@')}`);
    console.log('------------------------------------------------------------');

    await connectDB();

    // 1. Clean existing records in correct dependency order
    console.log('[Seed] Clearing existing collections...');
    await Payment.deleteMany({});
    await Registration.deleteMany({});
    await TicketType.deleteMany({});
    await Event.deleteMany({});
    await Venue.deleteMany({});
    await User.deleteMany({});
    console.log('[Seed] Collections wiped successfully.');

    // 2. Insert Users (Password will be hashed via pre-save hook)
    console.log('[Seed] Inserting users...');
    const createdUsers = [];
    for (const u of sampleUsers) {
      const userDoc = new User({
        name: u.name,
        email: u.email,
        passwordHash: u.password, // Pre-save hook will bcrypt hash this
        role: u.role,
        isActive: u.isActive,
      });
      await userDoc.save();
      createdUsers.push(userDoc);
    }
    console.log(`[Seed] Created ${createdUsers.length} users (1 Admin, 2 Organizers, 5 Attendees).`);

    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const organizers = createdUsers.filter((u) => u.role === 'organizer');
    const attendees = createdUsers.filter((u) => u.role === 'attendee');

    // 3. Insert Venues (created by organizers)
    console.log('[Seed] Inserting venues...');
    const venueDocs = await Venue.insertMany([
      { ...sampleVenues[0], createdBy: organizers[0]._id },
      { ...sampleVenues[1], createdBy: organizers[1]._id },
      { ...sampleVenues[2], createdBy: organizers[0]._id },
    ]);
    console.log(`[Seed] Created ${venueDocs.length} venues.`);

    // 4. Insert Events
    console.log('[Seed] Inserting events...');
    const rawEvents = getSampleEvents(
      venueDocs.map((v) => v._id),
      organizers.map((o) => o._id)
    );
    const eventDocs = await Event.insertMany(rawEvents);
    console.log(`[Seed] Created ${eventDocs.length} events across varied categories.`);

    // 5. Insert Ticket Types for Events
    console.log('[Seed] Inserting ticket types...');
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const ticketTypesData = [
      // Event 0 (Symphonia Concert)
      {
        event: eventDocs[0]._id,
        name: 'General Admission',
        price: 55,
        quantityTotal: 300,
        quantitySold: 0,
        saleStart: pastDate,
        saleEnd: futureDate,
      },
      {
        event: eventDocs[0]._id,
        name: 'VIP Balcony Tier',
        price: 120,
        quantityTotal: 50,
        quantitySold: 0,
        saleStart: pastDate,
        saleEnd: futureDate,
      },
      // Event 1 (Distributed Systems Summit)
      {
        event: eventDocs[1]._id,
        name: 'Early Bird Pass',
        price: 199,
        quantityTotal: 150,
        quantitySold: 0,
        saleStart: pastDate,
        saleEnd: futureDate,
      },
      {
        event: eventDocs[1]._id,
        name: 'Standard Conference Pass',
        price: 349,
        quantityTotal: 500,
        quantitySold: 0,
        saleStart: pastDate,
        saleEnd: futureDate,
      },
      // Event 2 (Typography Workshop)
      {
        event: eventDocs[2]._id,
        name: 'Workshop Seat',
        price: 85,
        quantityTotal: 40,
        quantitySold: 0,
        saleStart: pastDate,
        saleEnd: futureDate,
      },
      // Event 3 (AI Seminar)
      {
        event: eventDocs[3]._id,
        name: 'Delegate Admission',
        price: 45,
        quantityTotal: 200,
        quantitySold: 0,
        saleStart: pastDate,
        saleEnd: futureDate,
      },
      // Event 4 (Film Meetup)
      {
        event: eventDocs[4]._id,
        name: 'Free RSVP',
        price: 0,
        quantityTotal: 100,
        quantitySold: 0,
        saleStart: now,
        saleEnd: futureDate,
      },
      // Event 5 (Heritage Printmaking - completed)
      {
        event: eventDocs[5]._id,
        name: 'Exhibition Entry',
        price: 25,
        quantityTotal: 250,
        quantitySold: 0,
        saleStart: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        saleEnd: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    const ticketTypeDocs = await TicketType.insertMany(ticketTypesData);
    console.log(`[Seed] Created ${ticketTypeDocs.length} ticket tiers.`);

    // 6. Insert Sample Registrations and Payments
    console.log('[Seed] Inserting sample registrations and payments...');

    const sampleBookings = [
      {
        user: attendees[0]._id,
        event: eventDocs[0]._id,
        ticketType: ticketTypeDocs[0]._id, // General Admission ($55)
        quantity: 2,
        status: 'confirmed',
        attendance: 'checked_in',
        checkedInAt: new Date(),
        paymentMethod: 'card',
        amount: 110,
      },
      {
        user: attendees[1]._id,
        event: eventDocs[0]._id,
        ticketType: ticketTypeDocs[1]._id, // VIP Balcony ($120)
        quantity: 1,
        status: 'confirmed',
        attendance: 'pending',
        checkedInAt: null,
        paymentMethod: 'upi',
        amount: 120,
      },
      {
        user: attendees[2]._id,
        event: eventDocs[1]._id,
        ticketType: ticketTypeDocs[2]._id, // Early Bird ($199)
        quantity: 1,
        status: 'confirmed',
        attendance: 'pending',
        checkedInAt: null,
        paymentMethod: 'card',
        amount: 199,
      },
      {
        user: attendees[3]._id,
        event: eventDocs[1]._id,
        ticketType: ticketTypeDocs[3]._id, // Standard Pass ($349)
        quantity: 1,
        status: 'confirmed',
        attendance: 'checked_in',
        checkedInAt: new Date(),
        paymentMethod: 'card',
        amount: 349,
      },
      {
        user: attendees[4]._id,
        event: eventDocs[2]._id,
        ticketType: ticketTypeDocs[4]._id, // Workshop ($85)
        quantity: 1,
        status: 'confirmed',
        attendance: 'pending',
        checkedInAt: null,
        paymentMethod: 'cash',
        amount: 85,
      },
      {
        user: attendees[0]._id,
        event: eventDocs[3]._id,
        ticketType: ticketTypeDocs[5]._id, // AI Seminar ($45)
        quantity: 2,
        status: 'confirmed',
        attendance: 'pending',
        checkedInAt: null,
        paymentMethod: 'upi',
        amount: 90,
      },
      {
        user: attendees[1]._id,
        event: eventDocs[5]._id,
        ticketType: ticketTypeDocs[7]._id, // Past exhibition ($25)
        quantity: 2,
        status: 'confirmed',
        attendance: 'checked_in',
        checkedInAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        paymentMethod: 'card',
        amount: 50,
      },
    ];

    let totalRegistrations = 0;
    let totalPayments = 0;

    for (const b of sampleBookings) {
      const reg = new Registration({
        user: b.user,
        event: b.event,
        ticketType: b.ticketType,
        quantity: b.quantity,
        status: b.status,
        attendance: b.attendance,
        checkedInAt: b.checkedInAt,
      });
      await reg.save();
      totalRegistrations++;

      // Update quantitySold on the ticket type
      await TicketType.findByIdAndUpdate(b.ticketType, {
        $inc: { quantitySold: b.quantity },
      });

      // Create matching Payment
      const pay = new Payment({
        registration: reg._id,
        amount: b.amount,
        method: b.paymentMethod,
        status: 'paid',
        paidAt: b.checkedInAt || new Date(),
      });
      await pay.save();
      totalPayments++;
    }

    console.log(`[Seed] Created ${totalRegistrations} registrations and ${totalPayments} payment records.`);

    // 7. Print Output Summary & Demo Credentials Table
    console.log('\n============================================================');
    console.log('             DATABASE SEED COMPLETED SUCCESSFULLY            ');
    console.log('============================================================');
    console.log('Summary of Sample Records:');
    console.log(` • Users:         ${createdUsers.length} (1 Admin, 2 Organizers, 5 Attendees)`);
    console.log(` • Venues:        ${venueDocs.length}`);
    console.log(` • Events:        ${eventDocs.length} (Published, Draft, Completed)`);
    console.log(` • Ticket Tiers:  ${ticketTypeDocs.length}`);
    console.log(` • Bookings:      ${totalRegistrations}`);
    console.log(` • Payments:      ${totalPayments}`);
    console.log('------------------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('┌──────────────┬──────────────────────────┬──────────────┐');
    console.log('│ Role         │ Email                    │ Password     │');
    console.log('├──────────────┼──────────────────────────┼──────────────┤');
    console.log('│ Admin        │ admin@eventbox.com       │ Admin@123456 │');
    console.log('│ Organizer 1  │ organizer1@eventbox.com  │ Org@123456   │');
    console.log('│ Organizer 2  │ organizer2@eventbox.com  │ Org@123456   │');
    console.log('│ Attendee 1   │ attendee1@eventbox.com   │ User@123456  │');
    console.log('│ Attendee 2   │ attendee2@eventbox.com   │ User@123456  │');
    console.log('│ Attendee 3   │ attendee3@eventbox.com   │ User@123456  │');
    console.log('│ Attendee 4   │ attendee4@eventbox.com   │ User@123456  │');
    console.log('│ Attendee 5   │ attendee5@eventbox.com   │ User@123456  │');
    console.log('└──────────────┴──────────────────────────┴──────────────┘');
    console.log('============================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
