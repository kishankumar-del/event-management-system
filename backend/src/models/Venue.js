const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required.'],
      trim: true,
      maxlength: [150, 'Venue name cannot exceed 150 characters.'],
    },
    address: {
      type: String,
      required: [true, 'Venue street address is required.'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required.'],
      trim: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Venue capacity is required.'],
      min: [1, 'Capacity must be at least 1 person.'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Venue creator is required.'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on city and name for location searches
venueSchema.index({ city: 1, name: 1 });

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue;
