# Vendor Backend API Documentation

## Base URL
- **Production**: `https://vendor-backend-7cn3.onrender.com`
- **Local Development**: `http://localhost:3000`

## Customer Backend Integration
- **Customer Backend URL**: `https://convenzcusb-backend.onrender.com`
- **Notification Endpoint**: `POST /api/user/booking/status-update`

---

## 🔥 NEW Vendor-Specific Endpoints

### 1. Vendor Registration
**POST** `/vendor/register`

Register a new vendor or send OTP to existing vendor.

**Request Body:**
```json
{
  "mobile": "+919876543210",
  "vendorName": "John's Plumbing Services"
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "message": "OTP sent successfully",
  "vendorId": "693129888a756180b1d3c6fc",
  "otp": "5818"
}
```

---

### 2. Verify OTP
**POST** `/vendor/verify-otp`

Verify OTP and get JWT token.

**Request Body:**
```json
{
  "mobile": "+919876543210",
  "otp": "5818"
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vendor": {
    "_id": "693129888a756180b1d3c6fc",
    "mobile": "+919876543210",
    "vendorName": "John's Plumbing Services",
    "mobileVerified": true,
    "businessName": "",
    "selectedServices": []
  }
}
```

---

### 3. Update FCM Token
**POST** `/vendor/update-fcm-token`

Update vendor's Firebase Cloud Messaging token for push notifications.

**Request Body:**
```json
{
  "vendorId": "693129888a756180b1d3c6fc",
  "fcmToken": "fKj8fj3k4jf9sdf...",
  "deviceId": "device_001",
  "platform": "android"
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "message": "FCM token updated successfully"
}
```

---

### 4. Update Location
**POST** `/vendor/update-location`

Update vendor's current GPS location.

**Request Body:**
```json
{
  "vendorId": "693129888a756180b1d3c6fc",
  "lat": 37.7749,
  "lng": -122.4194,
  "accuracy": 10,
  "timestamp": "2025-12-04T06:26:35.586Z"
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "message": "Location updated successfully"
}
```

**Validation:**
- `lat`: -90 to 90
- `lng`: -180 to 180

---

### 5. New Booking (Server-to-Server)
**POST** `/vendor/api/new-booking`

Called by customer backend to create a new booking for a vendor.

**Request Body:**
```json
{
  "bookingId": "BK123456",
  "customerId": "CUST001",
  "vendorId": "693129888a756180b1d3c6fc",
  "serviceType": "plumbing",
  "customerName": "John Doe",
  "customerPhone": "+919123456789",
  "customerAddress": "123 Main St, San Francisco, CA",
  "scheduledTime": "2025-12-05T10:00:00Z",
  "amount": 500,
  "notes": "Bathroom sink repair"
}
```

**Response (201 Created):**
```json
{
  "ok": true,
  "message": "Booking created successfully",
  "booking": {
    "bookingId": "BK123456",
    "customerId": "CUST001",
    "vendorId": "693129888a756180b1d3c6fc",
    "serviceType": "plumbing",
    "customerName": "John Doe",
    "customerPhone": "+919123456789",
    "customerAddress": "123 Main St, San Francisco, CA",
    "scheduledTime": "2025-12-05T10:00:00.000Z",
    "status": "pending",
    "otpStart": null,
    "otpUsed": false,
    "amount": 500,
    "notes": "Bathroom sink repair",
    "_id": "693129a28a756180b1d3c707",
    "createdAt": "2025-12-04T06:26:42.215Z",
    "updatedAt": "2025-12-04T06:26:42.215Z"
  }
}
```

---

### 6. Update Booking Status
**POST** `/vendor/booking/update-status`

Vendor accepts or rejects a booking. Notifies customer backend automatically.

**Request Body (Accept):**
```json
{
  "bookingId": "BK123456",
  "vendorId": "693129888a756180b1d3c6fc",
  "status": "accepted"
}
```

**Request Body (Reject):**
```json
{
  "bookingId": "BK123456",
  "vendorId": "693129888a756180b1d3c6fc",
  "status": "rejected",
  "rejectionReason": "Not available at scheduled time"
}
```

**Response (200 OK) - Accept:**
```json
{
  "ok": true,
  "message": "Booking accepted successfully",
  "booking": {
    "bookingId": "BK123456",
    "status": "accepted",
    "otpStart": "6384"
  }
}
```

**Response (200 OK) - Reject:**
```json
{
  "ok": true,
  "message": "Booking rejected successfully",
  "booking": {
    "bookingId": "BK123456",
    "status": "rejected",
    "otpStart": null
  }
}
```

**Customer Backend Notification:**

When a vendor accepts/rejects a booking, this backend automatically sends a notification to:
`POST https://convenzcusb-backend.onrender.com/api/user/booking/status-update`

```json
{
  "bookingId": "BK123456",
  "customerId": "CUST001",
  "vendorId": "693129888a756180b1d3c6fc",
  "status": "accepted",
  "otpStart": "6384",
  "updatedAt": "2025-12-04T06:26:48.660Z"
}
```

---

## 🔐 Existing API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to vendor mobile
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Vendors
- `POST /api/vendors` - Create vendor profile
- `GET /api/vendors/me` - Get current vendor profile (requires JWT)
- `PATCH /api/vendors/me` - Update vendor profile (requires JWT)

### Bookings (Legacy)
- `POST /api/booking/accept` - Accept a booking
- `POST /api/booking/reject` - Reject a booking
- `POST /api/booking/start` - Start job with OTP
- `POST /api/booking/complete` - Complete job with OTP
- `GET /api/vendor/bookings/pending` - Get pending bookings

### Work Types
- `GET /api/work-types` - Get all available work types

### Orders
- `GET /api/orders` - Get orders list
- `POST /api/orders` - Create new order

### Earnings
- `GET /api/earnings` - Get vendor earnings

---

## Error Responses

### 400 Bad Request
```json
{
  "ok": false,
  "error": "Mobile number is required"
}
```

### 404 Not Found
```json
{
  "ok": false,
  "error": "Vendor not found"
}
```

### 500 Internal Server Error
```json
{
  "ok": false,
  "error": "Server error",
  "message": "Detailed error message"
}
```

---

## Testing the API

### Local Testing
```bash
# 1. Register vendor
curl -X POST http://localhost:3000/vendor/register \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "vendorName": "Test Vendor"}'

# 2. Verify OTP
curl -X POST http://localhost:3000/vendor/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "5818"}'

# 3. Update FCM token
curl -X POST http://localhost:3000/vendor/update-fcm-token \
  -H "Content-Type: application/json" \
  -d '{"vendorId": "693129888a756180b1d3c6fc", "fcmToken": "test_token_123"}'

# 4. Update location
curl -X POST http://localhost:3000/vendor/update-location \
  -H "Content-Type: application/json" \
  -d '{"vendorId": "693129888a756180b1d3c6fc", "lat": 37.7749, "lng": -122.4194}'

# 5. Create booking (customer backend simulation)
curl -X POST http://localhost:3000/vendor/api/new-booking \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BK123456",
    "customerId": "CUST001",
    "vendorId": "693129888a756180b1d3c6fc",
    "serviceType": "plumbing",
    "amount": 500
  }'

# 6. Accept booking
curl -X POST http://localhost:3000/vendor/booking/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BK123456",
    "vendorId": "693129888a756180b1d3c6fc",
    "status": "accepted"
  }'
```

### Production Testing
Replace `http://localhost:3000` with `https://vendor-backend-7cn3.onrender.com`

---

## Database Models

### Vendor Schema
```javascript
{
  mobile: String (unique, required),
  vendorName: String,
  mobileVerified: Boolean,
  businessName: String,
  selectedServices: Array,
  fcmTokens: [{
    token: String,
    deviceId: String,
    platform: String,
    lastUsed: Date
  }]
}
```

### Booking Schema
```javascript
{
  bookingId: String (unique, required),
  customerId: String (required),
  vendorId: ObjectId (ref: Vendor, required),
  serviceType: String (required),
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  scheduledTime: Date,
  status: String (enum: pending, accepted, rejected, started, completed, cancelled),
  otpStart: String,
  otpUsed: Boolean,
  amount: Number,
  notes: String
}
```

### VendorLocation Schema
```javascript
{
  vendorId: ObjectId (ref: Vendor, required),
  loc: {
    type: 'Point',
    coordinates: [lng, lat]
  },
  accuracy: Number,
  timestamp: Date
}
```

---

## Architecture

### Server-to-Server Communication Flow

1. **Customer Backend** creates booking → `POST /vendor/api/new-booking`
2. **Vendor Backend** stores booking in database
3. **Vendor Backend** sends FCM push notification to vendor's mobile app
4. **Vendor** accepts/rejects via mobile app → `POST /vendor/booking/update-status`
5. **Vendor Backend** updates booking status and notifies **Customer Backend** → `POST https://convenzcusb-backend.onrender.com/api/user/booking/status-update`
6. **Customer Backend** updates customer's app via FCM/WebSocket

### Retry Logic
- Customer backend notifications retry 3 times with exponential backoff (1s, 2s, 3s)
- Non-blocking async notifications ensure vendor app gets immediate response

---

## Environment Variables

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/vendor-db
JWT_SECRET=your_jwt_secret_key_here
CUSTOMER_BACKEND_URL=https://convenzcusb-backend.onrender.com
FIREBASE_PROJECT_ID=convenz-customer-dfce7
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@convenz-customer-dfce7.iam.gserviceaccount.com
```

---

## Deployment

### Render.com
1. Connect GitHub repository
2. Set environment variables in Render dashboard
3. Deploy branch: `main`
4. Auto-deploy on push: Enabled
5. Health check: `GET /health`

---

## Version History

### v2.0.0 (2025-12-04)
- ✅ Added `/vendor/register` - Vendor registration with OTP
- ✅ Added `/vendor/verify-otp` - OTP verification with JWT
- ✅ Added `/vendor/update-fcm-token` - FCM token management
- ✅ Added `/vendor/update-location` - GPS location tracking
- ✅ Added `/vendor/api/new-booking` - Server-to-server booking creation
- ✅ Added `/vendor/booking/update-status` - Booking accept/reject with customer backend notification
- ✅ Integrated customer backend communication with retry logic
- ✅ Comprehensive logging for debugging
- ✅ Production-ready error handling

### v1.0.2 (Previous)
- Basic vendor authentication
- Booking management
- Work types system
- Firebase FCM integration

---

## Support

For issues or questions:
- Email: support@convenz.app
- GitHub: [vendor-backend repository]
- Deployed: https://vendor-backend-7cn3.onrender.com
