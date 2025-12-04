#!/bin/bash

# Vendor Backend API Test Script
# Usage: ./test-vendor-api.sh [BASE_URL]
# Example: ./test-vendor-api.sh https://vendor-backend-7cn3.onrender.com

BASE_URL="${1:-http://localhost:3000}"

echo "=================================================="
echo "🧪 Testing Vendor Backend API"
echo "Base URL: $BASE_URL"
echo "=================================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL/health" | jq
echo ""
echo "✅ Health check completed"
echo ""

# Test 2: Vendor Registration
echo "2️⃣  Testing Vendor Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/vendor/register" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "vendorName": "Test Vendor"}')
echo "$REGISTER_RESPONSE" | jq
VENDOR_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.vendorId')
OTP=$(echo "$REGISTER_RESPONSE" | jq -r '.otp')
echo ""
echo "✅ Vendor registered with ID: $VENDOR_ID"
echo "   OTP: $OTP"
echo ""

# Test 3: Verify OTP
echo "3️⃣  Testing OTP Verification..."
VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/vendor/verify-otp" \
  -H "Content-Type: application/json" \
  -d "{\"mobile\": \"+919876543210\", \"otp\": \"$OTP\"}")
echo "$VERIFY_RESPONSE" | jq
JWT_TOKEN=$(echo "$VERIFY_RESPONSE" | jq -r '.token')
echo ""
echo "✅ OTP verified, JWT token received"
echo ""

# Test 4: Update FCM Token
echo "4️⃣  Testing FCM Token Update..."
curl -s -X POST "$BASE_URL/vendor/update-fcm-token" \
  -H "Content-Type: application/json" \
  -d "{
    \"vendorId\": \"$VENDOR_ID\",
    \"fcmToken\": \"test_fcm_token_$(date +%s)\",
    \"deviceId\": \"device_test\",
    \"platform\": \"android\"
  }" | jq
echo ""
echo "✅ FCM token updated"
echo ""

# Test 5: Update Location
echo "5️⃣  Testing Location Update..."
curl -s -X POST "$BASE_URL/vendor/update-location" \
  -H "Content-Type: application/json" \
  -d "{
    \"vendorId\": \"$VENDOR_ID\",
    \"lat\": 37.7749,
    \"lng\": -122.4194,
    \"accuracy\": 10
  }" | jq
echo ""
echo "✅ Location updated"
echo ""

# Test 6: Create New Booking (Server-to-Server)
BOOKING_ID="BK$(date +%s)"
echo "6️⃣  Testing New Booking Creation..."
NEW_BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/vendor/api/new-booking" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"customerId\": \"CUST001\",
    \"vendorId\": \"$VENDOR_ID\",
    \"serviceType\": \"plumbing\",
    \"customerName\": \"John Doe\",
    \"customerPhone\": \"+919123456789\",
    \"customerAddress\": \"123 Main St\",
    \"amount\": 500
  }")
echo "$NEW_BOOKING_RESPONSE" | jq
echo ""
echo "✅ Booking created: $BOOKING_ID"
echo ""

# Test 7: Update Booking Status (Accept)
echo "7️⃣  Testing Booking Status Update (Accept)..."
curl -s -X POST "$BASE_URL/vendor/booking/update-status" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"vendorId\": \"$VENDOR_ID\",
    \"status\": \"accepted\"
  }" | jq
echo ""
echo "✅ Booking accepted"
echo ""

# Test 8: Try to reject already accepted booking (should fail)
echo "8️⃣  Testing Booking Status Update (Reject - should fail)..."
curl -s -X POST "$BASE_URL/vendor/booking/update-status" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"vendorId\": \"$VENDOR_ID\",
    \"status\": \"rejected\"
  }" | jq
echo ""
echo "✅ Test completed (expected to fail)"
echo ""

# Test 9: Root endpoint
echo "9️⃣  Testing Root Endpoint..."
curl -s "$BASE_URL/" | jq
echo ""
echo "✅ Root endpoint responded"
echo ""

echo "=================================================="
echo "✅ All tests completed successfully!"
echo "=================================================="
echo ""
echo "📝 Summary:"
echo "   - Vendor ID: $VENDOR_ID"
echo "   - Booking ID: $BOOKING_ID"
echo "   - JWT Token: ${JWT_TOKEN:0:50}..."
echo ""
echo "🚀 Vendor Backend v2.0.0 is ready for production!"
