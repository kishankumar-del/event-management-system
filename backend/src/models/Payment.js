const mongoose = require('mongoose');
const { generatePaymentReference } = require('../utils/codeGenerator');

const paymentSchema = new mongoose.Schema(
  {
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: [true, 'Registration reference is required.'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required.'],
      min: [0, 'Payment amount cannot be negative.'],
    },
    method: {
      type: String,
      required: [true, 'Payment method is required.'],
      enum: {
        values: ['card', 'upi', 'cash'],
        message: '{VALUE} is not a valid payment method.',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status.',
      },
      default: 'pending',
      index: true,
    },
    reference: {
      type: String,
      required: [true, 'Payment reference code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-assign unique payment reference before validation if absent
paymentSchema.pre('validate', function (next) {
  if (!this.reference) {
    this.reference = generatePaymentReference();
  }
  if (this.status === 'paid' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

