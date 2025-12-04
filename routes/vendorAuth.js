const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');
const VendorLocation = require('../models/vendorLocation');
const { sendOtp, verifyOtp } = require('../utils/otpStore');
const { signToken } = require('../utils/jwt');

/**
 * POST /vendor/register
 * Register vendor and send OTP
 */
router.post('/register', async (req, res) => {
  try {
    const { mobile, vendorName } = req.body;

    if (!mobile || typeof mobile !== 'string' || mobile.trim() === '') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Mobile number is required' 
      });
    }

    const cleanMobile = mobile.trim();
    console.log(`[VENDOR-AUTH] Register request for mobile: ${cleanMobile}`);

    // Find or create vendor
    let vendor = await Vendor.findOne({ mobile: cleanMobile });

    if (!vendor) {
      vendor = new Vendor({
        mobile: cleanMobile,
        vendorName: vendorName || 'Vendor',
        mobileVerified: false,
      });
      await vendor.save();
      console.log(`[VENDOR-AUTH] New vendor created: ${vendor._id}`);
    } else {
      console.log(`[VENDOR-AUTH] Existing vendor found: ${vendor._id}`);
    }

    // Send OTP
    const otpResult = sendOtp(cleanMobile);

    if (otpResult.success) {
      console.log(`[VENDOR-AUTH] OTP sent to ${cleanMobile}: ${otpResult.code}`);
      return res.status(200).json({
        ok: true,
        message: 'OTP sent successfully',
        vendorId: vendor._id,
        otp: otpResult.code, // For testing
      });
    }

    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to send OTP' 
    });
  } catch (error) {
    console.error('[VENDOR-AUTH] Register error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

/**
 * POST /vendor/verify-otp
 * Verify OTP and return JWT token
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Mobile and OTP are required' 
      });
    }

    const cleanMobile = mobile.trim();
    console.log(`[VENDOR-AUTH] Verify OTP for mobile: ${cleanMobile}`);

    // Verify OTP
    const isValid = verifyOtp(cleanMobile, otp);

    if (!isValid) {
      console.log(`[VENDOR-AUTH] Invalid OTP for ${cleanMobile}`);
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid or expired OTP' 
      });
    }

    // Find vendor
    const vendor = await Vendor.findOne({ mobile: cleanMobile });

    if (!vendor) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Vendor not found' 
      });
    }

    // Update mobile verification status
    if (!vendor.mobileVerified) {
      vendor.mobileVerified = true;
      await vendor.save();
      console.log(`[VENDOR-AUTH] Mobile verified for vendor: ${vendor._id}`);
    }

    // Generate JWT token
    const token = signToken({ 
      _id: vendor._id, 
      mobile: vendor.mobile,
      vendorName: vendor.vendorName 
    });

    console.log(`[VENDOR-AUTH] JWT token generated for vendor: ${vendor._id}`);

    return res.status(200).json({
      ok: true,
      message: 'OTP verified successfully',
      token,
      vendor: {
        _id: vendor._id,
        mobile: vendor.mobile,
        vendorName: vendor.vendorName,
        mobileVerified: vendor.mobileVerified,
        businessName: vendor.businessName,
        selectedServices: vendor.selectedServices,
      },
    });
  } catch (error) {
    console.error('[VENDOR-AUTH] Verify OTP error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

/**
 * POST /vendor/update-fcm-token
 * Update vendor FCM token for push notifications
 */
router.post('/update-fcm-token', async (req, res) => {
  try {
    const { vendorId, fcmToken, deviceId, platform } = req.body;

    if (!vendorId || !fcmToken) {
      return res.status(400).json({ 
        ok: false, 
        error: 'vendorId and fcmToken are required' 
      });
    }

    console.log(`[VENDOR-AUTH] Update FCM token for vendor: ${vendorId}`);

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
      return res.status(404).json({ 
        ok: false, 
        error: 'Vendor not found' 
      });
    }

    // Remove old token if exists
    vendor.fcmTokens = vendor.fcmTokens.filter(t => t.token !== fcmToken);

    // Add new token
    vendor.fcmTokens.push({
      token: fcmToken,
      deviceId: deviceId || null,
      platform: platform || 'android',
      lastUsed: new Date(),
    });

    // Keep only last 5 tokens per vendor
    if (vendor.fcmTokens.length > 5) {
      vendor.fcmTokens = vendor.fcmTokens.slice(-5);
    }

    await vendor.save();

    console.log(`[VENDOR-AUTH] FCM token updated for vendor: ${vendorId}`);

    return res.status(200).json({
      ok: true,
      message: 'FCM token updated successfully',
    });
  } catch (error) {
    console.error('[VENDOR-AUTH] Update FCM token error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

/**
 * POST /vendor/update-location
 * Update vendor's current location
 */
router.post('/update-location', async (req, res) => {
  try {
    const { vendorId, lat, lng, accuracy, timestamp } = req.body;

    if (!vendorId || typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ 
        ok: false, 
        error: 'vendorId, lat, and lng are required' 
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid coordinates' 
      });
    }

    console.log(`[VENDOR-LOCATION] Update location for vendor: ${vendorId}`);

    const location = new VendorLocation({
      vendorId,
      loc: { 
        type: 'Point', 
        coordinates: [lng, lat] 
      },
      accuracy: accuracy || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    await location.save();

    console.log(`[VENDOR-LOCATION] Location updated for vendor: ${vendorId}`);

    return res.status(200).json({
      ok: true,
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error('[VENDOR-LOCATION] Update location error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

module.exports = router;
