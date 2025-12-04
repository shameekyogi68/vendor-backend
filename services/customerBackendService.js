const axios = require('axios');
const config = require('../config');

/**
 * Notify customer backend about booking status update
 * POST https://convenzcusb-backend.onrender.com/api/user/booking/status-update
 */
async function notifyCustomerBackend(bookingData) {
  try {
    const url = `${config.customerBackendUrl}/api/user/booking/status-update`;
    
    console.log('[CUSTOMER-BACKEND] Notifying customer backend:', url);
    console.log('[CUSTOMER-BACKEND] Booking data:', JSON.stringify(bookingData, null, 2));

    const response = await axios.post(url, bookingData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('[CUSTOMER-BACKEND] Notification successful:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[CUSTOMER-BACKEND] Notification failed:', error.message);
    if (error.response) {
      console.error('[CUSTOMER-BACKEND] Response status:', error.response.status);
      console.error('[CUSTOMER-BACKEND] Response data:', error.response.data);
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Notify customer backend with retry logic
 */
async function notifyCustomerBackendWithRetry(bookingData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[CUSTOMER-BACKEND] Notification attempt ${attempt}/${maxRetries}`);
    
    const result = await notifyCustomerBackend(bookingData);
    
    if (result.success) {
      return result;
    }
    
    if (attempt < maxRetries) {
      const delay = attempt * 1000; // 1s, 2s, 3s
      console.log(`[CUSTOMER-BACKEND] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('[CUSTOMER-BACKEND] All notification attempts failed');
  return {
    success: false,
    error: 'Max retry attempts exceeded',
  };
}

module.exports = {
  notifyCustomerBackend,
  notifyCustomerBackendWithRetry,
};
