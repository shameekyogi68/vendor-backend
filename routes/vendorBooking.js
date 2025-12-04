const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const { generateJobOTP } = require('../utils/otpHelper');
const { notifyCustomerBackendWithRetry } = require('../services/customerBackendService');

/**
 * POST /vendor/api/new-booking
 * Called by customer backend to create a new booking
 * This is a server-to-server endpoint
 */
router.post('/api/new-booking', async (req, res) => {
  try {
    const {
      bookingId,
      customerId,
      vendorId,
      serviceType,
      customerName,
      customerPhone,
      customerAddress,
      scheduledTime,
      amount,
      notes,
    } = req.body;

    // Validate required fields
    if (!bookingId || !customerId || !vendorId || !serviceType) {
      return res.status(400).json({
        ok: false,
        error: 'bookingId, customerId, vendorId, and serviceType are required',
      });
    }

    console.log('[BOOKING] New booking received from customer backend:', bookingId);

    // Check if booking already exists
    let booking = await Booking.findOne({ bookingId });

    if (booking) {
      console.log('[BOOKING] Booking already exists:', bookingId);
      return res.status(200).json({
        ok: true,
        message: 'Booking already exists',
        booking,
      });
    }

    // Create new booking
    booking = new Booking({
      bookingId,
      customerId,
      vendorId,
      serviceType,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      customerAddress: customerAddress || '',
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      amount: amount || 0,
      notes: notes || '',
      status: 'pending',
    });

    await booking.save();

    console.log('[BOOKING] New booking created:', bookingId);

    // TODO: Send push notification to vendor's FCM token
    console.log('[BOOKING] TODO: Send FCM notification to vendor:', vendorId);

    return res.status(201).json({
      ok: true,
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('[BOOKING] New booking error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Server error',
      message: error.message,
    });
  }
});

/**
 * POST /vendor/booking/update-status
 * Vendor accepts/rejects a booking
 * Notifies customer backend about the status change
 */
router.post('/booking/update-status', async (req, res) => {
  try {
    const { bookingId, vendorId, status, rejectionReason } = req.body;

    // Validate required fields
    if (!bookingId || !vendorId || !status) {
      return res.status(400).json({
        ok: false,
        error: 'bookingId, vendorId, and status are required',
      });
    }

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        ok: false,
        error: 'status must be either "accepted" or "rejected"',
      });
    }

    console.log(`[BOOKING] Update status request: ${bookingId} -> ${status}`);

    // Find booking
    const booking = await Booking.findOne({ bookingId, vendorId });

    if (!booking) {
      return res.status(404).json({
        ok: false,
        error: 'Booking not found',
      });
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        ok: false,
        error: `Booking is already ${booking.status}`,
      });
    }

    // Update booking status
    booking.status = status;

    // If accepted, generate OTP for job start
    let otpStart = null;
    if (status === 'accepted') {
      otpStart = generateJobOTP();
      booking.otpStart = otpStart;
      console.log(`[BOOKING] Generated OTP for booking ${bookingId}: ${otpStart}`);
    }

    // If rejected, store reason
    if (status === 'rejected' && rejectionReason) {
      booking.notes = rejectionReason;
    }

    await booking.save();

    console.log(`[BOOKING] Booking ${bookingId} status updated to ${status}`);

    // Notify customer backend
    const notificationData = {
      bookingId: booking.bookingId,
      customerId: booking.customerId,
      vendorId: booking.vendorId,
      status: status,
      otpStart: otpStart,
      updatedAt: new Date().toISOString(),
    };

    // Non-blocking notification with retry
    notifyCustomerBackendWithRetry(notificationData).then((result) => {
      if (result.success) {
        console.log('[BOOKING] Customer backend notified successfully');
      } else {
        console.error('[BOOKING] Failed to notify customer backend:', result.error);
      }
    });

    return res.status(200).json({
      ok: true,
      message: `Booking ${status} successfully`,
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
        otpStart: otpStart,
      },
    });
  } catch (error) {
    console.error('[BOOKING] Update status error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Server error',
      message: error.message,
    });
  }
});

module.exports = router;
