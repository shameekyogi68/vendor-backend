const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    customerAddress: {
      type: String,
      default: '',
    },
    scheduledTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'started', 'completed', 'cancelled'],
      default: 'pending',
    },
    otpStart: {
      type: String,
      default: null,
    },
    otpUsed: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ vendorId: 1, status: 1 });
bookingSchema.index({ customerId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
