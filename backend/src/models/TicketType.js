const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required.'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Ticket tier name is required.'],
      trim: true,
      maxlength: [80, 'Ticket tier name cannot exceed 80 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Ticket price is required.'],
      min: [0, 'Ticket price cannot be negative.'],
      default: 0,
    },
    quantityTotal: {
      type: Number,
      required: [true, 'Total ticket quantity is required.'],
      min: [1, 'Total quantity must be at least 1.'],
    },
    quantitySold: {
      type: Number,
      default: 0,
      min: [0, 'Quantity sold cannot be negative.'],
    },
    saleStart: {
      type: Date,
      required: [true, 'Sale start date is required.'],
    },
    saleEnd: {
      type: Date,
      required: [true, 'Sale end date is required.'],
      validate: {
        validator: function (value) {
          return !this.saleStart || value >= this.saleStart;
        },
        message: 'Sale end date must be greater than or equal to sale start date.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring ticket tier names are unique within the same event
ticketTypeSchema.index({ event: 1, name: 1 }, { unique: true });

// Virtual to compute available tickets
ticketTypeSchema.virtual('quantityAvailable').get(function () {
  return Math.max(0, this.quantityTotal - this.quantitySold);
});

ticketTypeSchema.set('toJSON', { virtuals: true });
ticketTypeSchema.set('toObject', { virtuals: true });

const TicketType = mongoose.model('TicketType', ticketTypeSchema);

module.exports = TicketType;
