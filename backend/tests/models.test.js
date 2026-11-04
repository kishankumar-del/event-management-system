const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Venue = require('../src/models/Venue');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const Registration = require('../src/models/Registration');
const Payment = require('../src/models/Payment');

test('User Model Schema Validation', async (t) => {
  // Missing required fields
  const emptyUser = new User({});
  const err = emptyUser.validateSync();
  assert.ok(err.errors.name);
  assert.ok(err.errors.email);
  assert.ok(err.errors.passwordHash);

  // Invalid email format
  const badEmailUser = new User({
    name: 'Test User',
    email: 'notanemail',
    passwordHash: 'secret123',
  });
  const emailErr = badEmailUser.validateSync();
  assert.ok(emailErr.errors.email);

  // Role validation
  const badRoleUser = new User({
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'secret123',
    role: 'superman',
  });
  const roleErr = badRoleUser.validateSync();
  assert.ok(roleErr.errors.role);

  // Valid user defaults
  const validUser = new User({
    name: 'Valid User',
    email: 'valid@example.com',
    passwordHash: 'secret123',
  });
  assert.equal(validUser.validateSync(), undefined);
  assert.equal(validUser.role, 'attendee');
  assert.equal(validUser.isActive, true);
});

test('Venue Model Schema Validation and Indexes', async (t) => {
  const emptyVenue = new Venue({});
  const err = emptyVenue.validateSync();
  assert.ok(err.errors.name);
  assert.ok(err.errors.address);
  assert.ok(err.errors.city);
  assert.ok(err.errors.capacity);
  assert.ok(err.errors.createdBy);

  const validVenue = new Venue({
    name: 'Grand Concert Hall',
    address: '100 Main St',
    city: 'Boston',
    capacity: 500,
    createdBy: new mongoose.Types.ObjectId(),
  });
  assert.equal(validVenue.validateSync(), undefined);

  // Check indexes defined on schema
  const indexes = Venue.schema.indexes();
  const hasCityIndex = indexes.some((idx) => idx[0].city === 1 && idx[0].name === 1);
  assert.ok(hasCityIndex, 'Venue schema must have compound index on { city: 1, name: 1 }');
});

test('Event Model Schema Validation, Constraints & Indexes', async (t) => {
  const emptyEvent = new Event({});
  const err = emptyEvent.validateSync();
  assert.ok(err.errors.title);
  assert.ok(err.errors.description);
  assert.ok(err.errors.category);
  assert.ok(err.errors.startDate);
  assert.ok(err.errors.endDate);
  assert.ok(err.errors.venue);
  assert.ok(err.errors.organizer);
  assert.ok(err.errors.capacity);

  // Test invalid date range (endDate before startDate)
  const invalidDateEvent = new Event({
    title: 'Time Paradox Event',
    description: 'An event that ends before it begins',
    category: 'Conference',
    startDate: new Date('2026-12-10'),
    endDate: new Date('2026-12-05'),
    venue: new mongoose.Types.ObjectId(),
    organizer: new mongoose.Types.ObjectId(),
    capacity: 100,
  });
  const dateErr = invalidDateEvent.validateSync();
  assert.ok(dateErr.errors.endDate, 'Expected validation error when endDate is before startDate');

  // Check indexes: text index and compound status+startDate
  const indexes = Event.schema.indexes();
  const hasTextIndex = indexes.some((idx) => idx[0].title === 'text' && idx[0].description === 'text');
  assert.ok(hasTextIndex, 'Event schema must have text index on title and description');

  const hasStatusStartIndex = indexes.some((idx) => idx[0].status === 1 && idx[0].startDate === 1);
  assert.ok(hasStatusStartIndex, 'Event schema must have compound index on { status: 1, startDate: 1 }');
});

test('TicketType Model Schema Validation & Unique Compound Index', async (t) => {
  const emptyTicket = new TicketType({});
  const err = emptyTicket.validateSync();
  assert.ok(err.errors.event);
  assert.ok(err.errors.name);
  assert.ok(err.errors.quantityTotal);
  assert.ok(err.errors.saleStart);
  assert.ok(err.errors.saleEnd);

  // Negative price test
  const negativePriceTicket = new TicketType({ price: -10 });
  const negErr = negativePriceTicket.validateSync();
  assert.ok(negErr.errors.price, 'Price must not be negative');

  // Check unique compound index on event + name
  const indexes = TicketType.schema.indexes();
  const hasEventNameUnique = indexes.some(
    (idx) => idx[0].event === 1 && idx[0].name === 1 && idx[1]?.unique === true
  );
  assert.ok(hasEventNameUnique, 'TicketType must have unique compound index on { event: 1, name: 1 }');

  // Test virtual quantityAvailable
  const validTicket = new TicketType({
    event: new mongoose.Types.ObjectId(),
    name: 'Early Bird',
    price: 49.99,
    quantityTotal: 100,
    quantitySold: 25,
    saleStart: new Date('2026-01-01'),
    saleEnd: new Date('2026-06-01'),
  });
  assert.equal(validTicket.quantityAvailable, 75);
});

test('Registration Model Auto-Code Generation & Unique Index', async (t) => {
  const reg = new Registration({
    user: new mongoose.Types.ObjectId(),
    event: new mongoose.Types.ObjectId(),
    ticketType: new mongoose.Types.ObjectId(),
    quantity: 2,
  });

  // Pre-validate hook should assign a readable registrationCode
  await reg.validate();
  assert.ok(reg.registrationCode);
  assert.match(reg.registrationCode, /^REG-[A-Z0-9]{6}$/);
  assert.equal(reg.status, 'confirmed');
  assert.equal(reg.attendance, 'pending');

  // Check compound unique index on { user: 1, event: 1, ticketType: 1 }
  const indexes = Registration.schema.indexes();
  const hasCompoundIndex = indexes.some(
    (idx) => idx[0].user === 1 && idx[0].event === 1 && idx[0].ticketType === 1 && idx[1]?.unique === true
  );
  assert.ok(hasCompoundIndex, 'Registration must have compound unique index on { user: 1, event: 1, ticketType: 1 }');
});

test('Payment Model Auto-Reference & Schema Validation', async (t) => {
  const pay = new Payment({
    registration: new mongoose.Types.ObjectId(),
    amount: 149.5,
    method: 'card',
    status: 'paid',
  });

  await pay.validate();
  assert.ok(pay.reference);
  assert.match(pay.reference, /^PAY-\d{4}-\d{4}$/);
  assert.ok(pay.paidAt);
});
