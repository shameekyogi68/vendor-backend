const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

/**
 * Vendor booking action routes
 * All routes require authentication
 */

// Update booking status (accept/reject)
router.patch('/update-status', authenticate, bookingController.updateBookingStatus);

// Start job with OTP verification
router.post('/start-job', authenticate, bookingController.startJob);

// Complete job
router.patch('/complete-job', authenticate, bookingController.completeJob);

// Get vendor bookings
router.get('/vendor/:vendorId', authenticate, bookingController.getVendorBookings);

module.exports = router;
