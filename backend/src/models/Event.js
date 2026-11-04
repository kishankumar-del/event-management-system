const mongoose = require('mongoose');

const EVENT_CATEGORIES = [
  'Conference',
  'Concert',
  'Workshop',
  'Seminar',
  'Meetup',
  'Festival',
  'Exhibition',
  'Other',
];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required.'],
      trim: true,
      maxlength: [200, 'Event title cannot exceed 200 characters.'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required.'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required.'],
      enum: {
        values: EVENT_CATEGORIES,
        message: '{VALUE} is not a supported event category.',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Event start date is required.'],
    },
    endDate: {
      type: Date,
      required: [true, 'Event end date is required.'],
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: 'End date must be greater than or equal to start date.',
      },
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Venue reference is required.'],
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer reference is required.'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid event status.',
      },
      default: 'draft',
      index: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required.'],
      min: [1, 'Capacity must be at least 1 person.'],
    },
  },
  {
    timestamps: true,
  }
);

// Full-text index on title and description for keyword searches
eventSchema.index({ title: 'text', description: 'text' });

// Compound index on status and startDate for efficient public listings
eventSchema.index({ status: 1, startDate: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
