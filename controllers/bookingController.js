const Booking = require('../models/booking');
const { generateJobOTP } = require('../utils/otpHelper');

/**
 * Helper function to send FCM notification to customer
 */
async function sendCustomerNotification(customerId, notification, data) {
  try {
    // For now, we'll log it. You can implement customer FCM token lookup later
    console.log('[BOOKING] Customer notification:', {
      customerId,
      notification,
      data,
    });
    
    // TODO: Implement customer FCM token lookup and send notification
    // const Customer = require('../models/customer');
    // const customer = await Customer.findById(customerId);
    // if (customer && customer.fcmTokens && customer.fcmTokens.length > 0) {
    //   const { sendPushToCustomer } = require('../services/notificationService');
    //   await sendPushToCustomer(customerId, notification, data);
    // }
    
    return { success: true };
  } catch (error) {
    console.error('[BOOKING] Error sending customer notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * PATCH /api/booking/update-status
 * Accept or reject a booking
 */
async function updateBookingStatus(req, res) {
  try {
    const { vendorId, bookingId, status } = req.body;

    // Validate required fields
    if (!vendorId || !bookingId || !status) {
      return res.status(400).json({
        ok: false,
        error: 'vendorId, bookingId, and status are required',
      });
    }

    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        ok: false,
        error: 'status must be either "accepted" or "rejected"',
      });
    }

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

    await booking.save();

    console.log(`[BOOKING] Booking ${bookingId} status updated to ${status}`);

    // Send FCM notification to customer
    const notificationData = {
      type: 'BOOKING_STATUS_UPDATE',
      bookingId: booking.bookingId,
      status: status,
    };

    if (otpStart) {
      notificationData.otpStart = otpStart;
    }

    await sendCustomerNotification(
      booking.customerId,
      {
        title: status === 'accepted' ? 'Booking Accepted' : 'Booking Rejected',
        body: status === 'accepted' 
          ? `Your booking has been accepted. OTP: ${otpStart}`
          : 'Your booking has been rejected',
      },
      notificationData
    );

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
      error: 'Failed to update booking status',
      message: error.message,
    });
  }
}

/**
 * POST /api/booking/start-job
 * Start a job by verifying OTP
 */
async function startJob(req, res) {
  try {
    const { bookingId, otp } = req.body;

    // Validate required fields
    if (!bookingId || !otp) {
      return res.status(400).json({
        ok: false,
        error: 'bookingId and otp are required',
      });
    }

    // Find booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        ok: false,
        error: 'Booking not found',
      });
    }

    // Check if booking is accepted
    if (booking.status !== 'accepted') {
      return res.status(400).json({
        ok: false,
        error: `Cannot start job. Booking status is ${booking.status}`,
      });
    }

    // Verify OTP
    if (booking.otpStart !== otp.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid OTP',
      });
    }

    // Check if OTP already used
    if (booking.otpUsed) {
      return res.status(400).json({
        ok: false,
        error: 'OTP already used',
      });
    }

    // Update booking status to started
    booking.status = 'started';
    booking.otpUsed = true;
    await booking.save();

    console.log(`[BOOKING] Job started for booking ${bookingId}`);

    // Send FCM notification to customer
    await sendCustomerNotification(
      booking.customerId,
      {
        title: 'Job Started',
        body: 'Your service provider has started the job',
      },
      {
        type: 'BOOKING_STATUS_UPDATE',
        bookingId: booking.bookingId,
        status: 'started',
      }
    );

    return res.status(200).json({
      ok: true,
      message: 'Job started successfully',
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('[BOOKING] Start job error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to start job',
      message: error.message,
    });
  }
}

/**
 * PATCH /api/booking/complete-job
 * Mark a job as completed
 */
async function completeJob(req, res) {
  try {
    const { bookingId, status } = req.body;

    // Validate required fields
    if (!bookingId || status !== 'completed') {
      return res.status(400).json({
        ok: false,
        error: 'bookingId is required and status must be "completed"',
      });
    }

    // Find booking
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({
        ok: false,
        error: 'Booking not found',
      });
    }

    // Check if booking is started
    if (booking.status !== 'started') {
      return res.status(400).json({
        ok: false,
        error: `Cannot complete job. Booking status is ${booking.status}`,
      });
    }

    // Update booking status to completed
    booking.status = 'completed';
    await booking.save();

    console.log(`[BOOKING] Job completed for booking ${bookingId}`);

    // Send FCM notification to customer
    await sendCustomerNotification(
      booking.customerId,
      {
        title: 'Job Completed',
        body: 'Your service has been completed',
      },
      {
        type: 'BOOKING_STATUS_UPDATE',
        bookingId: booking.bookingId,
        status: 'completed',
      }
    );

    return res.status(200).json({
      ok: true,
      message: 'Job completed successfully',
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('[BOOKING] Complete job error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to complete job',
      message: error.message,
    });
  }
}

/**
 * GET /api/booking/vendor/:vendorId
 * Get all bookings for a vendor
 */
async function getVendorBookings(req, res) {
  try {
    const { vendorId } = req.params;
    const { status } = req.query;

    const query = { vendorId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      bookings,
    });
  } catch (error) {
    console.error('[BOOKING] Get vendor bookings error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch bookings',
      message: error.message,
    });
  }
}

module.exports = {
  updateBookingStatus,
  startJob,
  completeJob,
  getVendorBookings,
};
