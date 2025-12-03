const config = require('../config');

/**
 * In-memory OTP store for development only.
 * 
 * TODO: For production with multiple instances, replace this with Redis or a similar
 * distributed cache to ensure OTPs are accessible across all server instances.
 * 
 * Structure: Map<mobile, { code, expiresAt }>
 */
const otpStore = new Map();

/**
 * Generate a random 4-digit OTP code
 * Always generates random OTP now for testing
 */
function generateOTP() {
  // Always generate random OTP for better testing
  const length = config.otpLength || 4;
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  console.log(`[OTP] Generated new code: ${otp}`);
  return otp;
}

/**
 * Send OTP (dev-only: stores in memory and logs to console)
 * Also sends push notification if vendor has FCM tokens (non-blocking)
 * @param {string} mobile - Mobile number
 * @returns {object} - { success: boolean, code: string (dev-only) }
 */
function sendOtp(mobile) {
  const code = generateOTP();
  const expiresAt = Date.now() + config.otpExpiry;

  otpStore.set(mobile, { code, expiresAt });

  // Log OTP to console for development
  console.log(`[OTP] Generated for ${mobile}: ${code} (expires in ${config.otpExpiry / 1000}s)`);

  // Try to send push notification (non-blocking)
  setImmediate(async () => {
    try {
      const Vendor = require('../models/vendor');
      console.log(`[OTP-PUSH] Looking up vendor with mobile: ${mobile}`);
      const vendor = await Vendor.findOne({ mobile });
      
      if (!vendor) {
        console.log(`[OTP-PUSH] No vendor found for mobile: ${mobile}`);
        return;
      }
      
      console.log(`[OTP-PUSH] Vendor found: ${vendor._id}, FCM tokens: ${vendor.fcmTokens?.length || 0}`);
      
      if (vendor.fcmTokens && vendor.fcmTokens.length > 0) {
        console.log(`[OTP-PUSH] FCM Tokens:`, vendor.fcmTokens.map(t => ({ token: t.token.substring(0, 20) + '...', platform: t.platform })));
        
        const { sendPushToVendor } = require('../services/notificationService');
        console.log(`[OTP-PUSH] Calling sendPushToVendor for vendor ${vendor._id}`);
        
        const result = await sendPushToVendor(
          vendor._id,
          {
            title: 'ConVenz - Your OTP',
            body: `Your verification code is: ${code}`
          },
          {
            type: 'OTP',
            code: code,
            mobile: mobile
          }
        );
        
        console.log(`[OTP-PUSH] sendPushToVendor result:`, result);
        
        if (result.success) {
          console.log(`[OTP-PUSH] ✅ Push notification sent successfully to ${vendor.mobile}`);
        } else {
          console.log(`[OTP-PUSH] ❌ Push notification failed: ${result.error}`);
        }
      } else {
        console.log(`[OTP-PUSH] No FCM tokens registered for ${mobile}`);
      }
    } catch (error) {
      console.error(`[OTP-PUSH] ❌ Error:`, error.message);
      console.error(`[OTP-PUSH] Stack:`, error.stack);
    }
  });

  return { success: true, code }; // Return code for dev/testing
}

/**
 * Verify OTP code for a mobile number
 * @param {string} mobile - Mobile number
 * @param {string} code - OTP code to verify
 * @returns {object} - { success: boolean, message: string }
 */
function verifyOtp(mobile, code) {
  const otpData = otpStore.get(mobile);

  if (!otpData) {
    return { success: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(mobile);
    return { success: false, message: 'OTP expired' };
  }

  if (otpData.code !== code) {
    return { success: false, message: 'Invalid OTP code' };
  }

  // OTP verified successfully - remove it from store (one-time use)
  otpStore.delete(mobile);
  return { success: true, message: 'OTP verified successfully' };
}

/**
 * Clear expired OTPs periodically (optional cleanup)
 */
function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [mobile, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(mobile);
    }
  }
}

// Run cleanup every 10 minutes (skip the interval during tests to avoid
// keeping the Node.js event loop alive and blocking Jest from exiting)
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupExpiredOtps, 10 * 60 * 1000);
}

module.exports = {
  sendOtp,
  verifyOtp,
};
