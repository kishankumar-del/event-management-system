const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

const registrationService = require('../src/services/registrationService');
const Event = require('../src/models/Event');
const TicketType = require('../src/models/TicketType');
const Registration = require('../src/models/Registration');
const Payment = require('../src/models/Payment');
const AppError = require('../src/utils/AppError');

test('Business Rule: Reject registration if event is in draft status', async () => {
  // Mock Event.findById to return a draft event
  const originalFindById = Event.findById;
  Event.findById = () => ({
    _id: new mongoose.Types.ObjectId(),
    status: 'draft',
    title: 'Unpublished Draft Event',
  });

  try {
    await assert.rejects(
      async () => {
        await registrationService.createRegistrationWithPayment({
          userId: new mongoose.Types.ObjectId(),
          eventId: new mongoose.Types.ObjectId(),
          ticketTypeId: new mongoose.Types.ObjectId(),
          quantity: 1,
          paymentMethod: 'card',
        });
      },
      (err) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes('published'));
        return true;
      }
    );
  } finally {
    Event.findById = originalFindById;
  }
});

test('Business Rule: Reject check-in if user is not organizer of the event', async () => {
  const organizerId = new mongoose.Types.ObjectId();
  const differentOrganizerId = new mongoose.Types.ObjectId();

  const originalFindById = Registration.findById;
  Registration.findById = () => ({
    populate: () => ({
      _id: new mongoose.Types.ObjectId(),
      status: 'confirmed',
      event: { organizer: organizerId },
    }),
  });

  try {
    await assert.rejects(
      async () => {
        await registrationService.checkInRegistration(
          new mongoose.Types.ObjectId(),
          'checked_in',
          { _id: differentOrganizerId, role: 'organizer' }
        );
      },
      (err) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, 403);
        assert.ok(err.message.includes('Only the event organizer or an admin'));
        return true;
      }
    );
  } finally {
    Registration.findById = originalFindById;
  }
});

test('Business Rule: Reject check-in if registration is already cancelled', async () => {
  const organizerId = new mongoose.Types.ObjectId();

  const originalFindById = Registration.findById;
  Registration.findById = () => ({
    populate: () => ({
      _id: new mongoose.Types.ObjectId(),
      status: 'cancelled',
      event: { organizer: organizerId },
    }),
  });

  try {
    await assert.rejects(
      async () => {
        await registrationService.checkInRegistration(
          new mongoose.Types.ObjectId(),
          'checked_in',
          { _id: organizerId, role: 'organizer' }
        );
      },
      (err) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, 400);
        assert.ok(err.message.includes('cancelled'));
        return true;
      }
    );
  } finally {
    Registration.findById = originalFindById;
  }
});
