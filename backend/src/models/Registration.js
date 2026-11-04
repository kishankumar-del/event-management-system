const mongoose = require('mongoose');
const { generateRegistrationCode } = require('../utils/codeGenerator');

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required.'],
      index: true,
    },
    ticketType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketType',
      required: [true, 'Ticket tier reference is required.'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Ticket quantity is required.'],
      min: [1, 'Quantity must be at least 1.'],
      default: 1,
    },
    status: {
      type: String,
      enum: {
        values: ['confirmed', 'cancelled'],
        message: '{VALUE} is not a valid registration status.',
      },
      default: 'confirmed',
      index: true,
    },
    attendance: {
      type: String,
      enum: {
        values: ['pending', 'checked_in', 'no_show'],
        message: '{VALUE} is not a valid attendance status.',
      },
      default: 'pending',
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    registrationCode: {
      type: String,
      required: [true, 'Registration code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index preventing duplicate registrations for the same user, event, and ticket tier
registrationSchema.index({ user: 1, event: 1, ticketType: 1 }, { unique: true });

// Auto-populate registrationCode before validation if not already set
registrationSchema.pre('validate', function (next) {
  if (!this.registrationCode) {
    this.registrationCode = generateRegistrationCode();
  }
  next();
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;

