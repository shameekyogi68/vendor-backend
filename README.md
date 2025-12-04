# Vendor Backend Server v2.0.0

A complete, production-ready Node.js/Express backend for vendor management in a service-booking platform. Features server-to-server communication with customer backend, Firebase Cloud Messaging, GPS location tracking, and comprehensive booking management.

## 🚀 Live Deployment

**Production URL:** https://vendor-backend-7cn3.onrender.com  
**Status:** ✅ Live and Running  
**Customer Backend:** https://convenzcusb-backend.onrender.com

## ✨ Features

### v2.0.0 - NEW Vendor-Specific Endpoints
- ✅ **Vendor Registration** with OTP verification
- ✅ **JWT Token Authentication** for secure API access
- ✅ **FCM Token Management** for push notifications
- ✅ **GPS Location Tracking** with GeoJSON support
- ✅ **Server-to-Server Booking API** (called by customer backend)
- ✅ **Booking Status Updates** with automatic customer backend notification
- ✅ **Retry Logic** for customer backend communication (3 attempts)

### Core Features
- ✅ **MongoDB Atlas** with Mongoose ODM
- ✅ **JWT Authentication** with Bearer tokens
- ✅ **OTP Verification** (4-digit, 5-minute expiry)
- ✅ **Firebase Cloud Messaging** for push notifications
- ✅ **File Uploads** using Multer (local storage)
- ✅ **Modular Architecture** (routes, models, middleware, services, utils)
- ✅ **RESTful API** with comprehensive error handling
- ✅ **CORS Enabled** for cross-origin requests
- ✅ **Environment Configuration** via `.env`
- ✅ **Comprehensive Logging** for debugging
- ✅ **Health Check Endpoint** for monitoring

## 🛠️ Tech Stack

- **Runtime**: Node.js >= 16.0.0
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Database: Convenz)
- **Authentication**: JWT (jsonwebtoken)
- **Push Notifications**: Firebase Admin SDK
- **File Upload**: Multer
- **HTTP Client**: axios (for server-to-server communication)
- **Environment**: dotenv
- **Deployment**: Render.com (auto-deploy on push)

## 📚 Documentation

- **[VENDOR_API_DOCUMENTATION.md](VENDOR_API_DOCUMENTATION.md)** - Complete API reference with examples
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Deployment details and checklist
- **[structure_server/Server_v3.md](structure_server/Server_v3.md)** - Server architecture
- **[test-vendor-api.sh](test-vendor-api.sh)** - Automated test script

## 📁 Project Structure

```
vendor-backend/
├── config/
│   ├── firebase.js         # Firebase Admin SDK configuration
│   └── index.js            # Environment configuration
├── controllers/
│   ├── devOrdersController.js
│   ├── earningsController.js
│   ├── orderController.js
│   ├── ordersController.js
│   ├── presenceController.js
│   ├── vendorController.js
│   └── workTypesController.js
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── rateLimiter.js      # Rate limiting
│   ├── requestId.js        # Request ID tracking
│   ├── serviceAuth.js      # Service-to-service auth
│   └── upload.js           # Multer file upload
├── models/
│   ├── booking.js          # 🆕 Booking schema with OTP
│   ├── order.js
│   ├── vendor.js           # Vendor schema with FCM tokens
│   ├── vendorLocation.js   # 🆕 GPS location tracking (GeoJSON)
│   ├── vendorPresence.js
│   └── workType.js
├── routes/
│   ├── auth.js             # OTP authentication
│   ├── booking.js          # Booking management (legacy)
│   ├── devOrders.js        # Dev/mock endpoints
│   ├── earnings.js
│   ├── orders.js
│   ├── ordersFetchList.js
│   ├── presence.js
│   ├── proxy.js
│   ├── vendorAuth.js       # 🆕 NEW: Vendor registration & auth
│   ├── vendorBooking.js    # 🆕 NEW: Server-to-server booking API
│   ├── vendorLocation.js
│   ├── vendors.js
│   └── workTypes.js
├── services/
│   ├── customerBackendService.js  # 🆕 NEW: Customer backend integration
│   ├── devOrdersService.js
│   ├── earningsService.js
│   ├── notificationService.js
│   ├── orderService.js
│   ├── ordersService.js
│   └── socketService.js
├── structure_server/
│   ├── API_details.md
│   └── Server_v3.md
├── tests/
│   ├── *.test.js           # Jest test suites
│   └── setup.js
├── uploads/                # Local file storage
├── utils/
│   ├── jwt.js              # JWT helpers
│   ├── logger.js
│   ├── otpHelper.js        # OTP generation
│   ├── otpStore.js         # In-memory OTP storage
│   ├── payment.js
├── DEPLOYMENT_SUMMARY.md   # 🆕 Deployment guide
├── VENDOR_API_DOCUMENTATION.md  # 🆕 Complete API docs
├── test-vendor-api.sh      # 🆕 Test script
├── .env                    # Environment variables (not in git)
├── .gitignore
├── package.json
├── server.js               # Main entry point
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/shameekyogi68/vendor-backend.git
cd vendor-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create `.env` file with required variables:

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Convenz
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CUSTOMER_BACKEND_URL=https://convenzcusb-backend.onrender.com

# Firebase Configuration
FIREBASE_PROJECT_ID=convenz-customer-dfce7
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@convenz-customer-dfce7.iam.gserviceaccount.com

# Optional
UPLOAD_DIR=uploads
ENABLE_WORK_TYPES=false
ENABLE_MOCK_ORDERS=false
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

### 5. Test API

```bash
# Test all endpoints
./test-vendor-api.sh http://localhost:3000

# Or test individual endpoints
curl http://localhost:3000/health
```

Server runs on: http://localhost:3000

## 🆕 NEW API Endpoints (v2.0.0)

### Vendor Registration & Authentication

#### 1. Register Vendor
```bash
curl -X POST https://vendor-backend-7cn3.onrender.com/vendor/register \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "vendorName": "John Plumber"}'
```

**Response:**
```json
{
  "ok": true,
  "message": "OTP sent successfully",
  "vendorId": "693129888a756180b1d3c6fc",
  "otp": "5818"
}
```

#### 2. Verify OTP
```bash
curl -X POST https://vendor-backend-7cn3.onrender.com/vendor/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "5818"}'
```

**Response:**
```json
{
  "ok": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vendor": {
    "_id": "693129888a756180b1d3c6fc",
    "mobile": "+919876543210",
    "vendorName": "John Plumber",
    "mobileVerified": true
  }
}
```

#### 3. Update FCM Token
```bash
curl -X POST https://vendor-backend-7cn3.onrender.com/vendor/update-fcm-token \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "693129888a756180b1d3c6fc",
    "fcmToken": "fKj8fj3k4jf9sdf...",
    "platform": "android"
  }'
```

#### 4. Update Location
```bash
curl -X POST https://vendor-backend-7cn3.onrender.com/vendor/update-location \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "693129888a756180b1d3c6fc",
    "lat": 37.7749,
    "lng": -122.4194
  }'
```

### Booking Management (Server-to-Server)

#### 5. Create New Booking (Customer Backend → Vendor Backend)
```bash
curl -X POST https://vendor-backend-7cn3.onrender.com/vendor/api/new-booking \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BK123456",
    "customerId": "CUST001",
    "vendorId": "693129888a756180b1d3c6fc",
    "serviceType": "plumbing",
    "amount": 500
  }'
```

#### 6. Update Booking Status (Vendor → Customer Backend)
```bash
curl -X POST https://vendor-backend-7cn3.onrender.com/vendor/booking/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BK123456",
    "vendorId": "693129888a756180b1d3c6fc",
    "status": "accepted"
  }'
```

**Response:**
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

> ⚠️ **Note:** When vendor accepts/rejects a booking, the backend **automatically notifies customer backend** at:  
> `POST https://convenzcusb-backend.onrender.com/api/user/booking/status-update`

---

## 📖 Complete API Documentation

For complete API documentation with all endpoints, request/response examples, and error codes:

👉 **[VENDOR_API_DOCUMENTATION.md](VENDOR_API_DOCUMENTATION.md)**

---

## 🧪 Testing

### Run Automated Test Script

```bash
# Test production
./test-vendor-api.sh https://vendor-backend-7cn3.onrender.com

# Test local
./test-vendor-api.sh http://localhost:3000
```

### Run Unit Tests

```bash
npm test
```

---

## 🏗️ Architecture

### Server-to-Server Communication Flow

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│                 │        │                 │        │                 │
│  Customer       │───────▶│  Vendor         │───────▶│  Vendor Mobile  │
│  Backend        │ Create │  Backend        │  FCM   │  App            │
│                 │ Booking│                 │  Push  │                 │
└─────────────────┘        └─────────────────┘        └─────────────────┘
         ▲                          │                          │
         │                          │                          │
         │                          ▼                          │
         │                  ┌─────────────────┐              │
         │                  │                 │              │
         │                  │  MongoDB        │              │
         │                  │  (Convenz DB)   │              │
         │                  │                 │              │
         │                  └─────────────────┘              │
         │                                                    │
         │                                                    ▼
         │                                          ┌─────────────────┐
         │                                          │  Vendor         │
         │                                          │  Accept/Reject  │
         │                                          │                 │
         │                                          └─────────────────┘
         │                                                    │
         │                                                    ▼
         └────────────────────────────────────────────────────┘
                        Notify Customer Backend
                      (with retry: 1s, 2s, 3s)
```

---

## 🔧 Legacy API Endpoints

### Authentication (Legacy)
```json
{
  "message": "verified",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vendorId": null
}
```

### Vendor Management

#### 3. Create Vendor

Create a new vendor profile with optional file uploads.

```bash
curl -X POST http://localhost:3000/api/vendors \
  -F "vendorName=John Doe" \
  -F "mobile=1234567890" \
  -F "gender=male" \
  -F "businessName=John's Services" \
  -F "businessAddress=123 Main St" \
  -F "businessType=Plumbing" \
  -F "selectedServices=[\"Pipe Repair\",\"Installation\"]" \
  -F "profile=@/path/to/profile.jpg" \
  -F "id=@/path/to/id-card.jpg" \
  -F "cert=@/path/to/certificate.jpg"
```

**Response:**
```json
{
  "message": "Vendor created successfully",
  "vendor": {
    "_id": "507f1f77bcf86cd799439011",
    "vendorName": "John Doe",
    "mobile": "1234567890",
    "mobileVerified": true,
    "gender": "male",
    "businessName": "John's Services",
    "businessAddress": "123 Main St",
    "businessType": "Plumbing",
    "selectedServices": ["Pipe Repair", "Installation"],
    "identityImages": {
      "profile": "/uploads/profile-1234567890-123456789.jpg",
      "id": "/uploads/id-card-1234567890-987654321.jpg",
      "cert": "/uploads/certificate-1234567890-456789123.jpg"
    },
    "createdAt": "2025-11-24T10:00:00.000Z",
    "updatedAt": "2025-11-24T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Get Current Vendor Profile

Get the authenticated vendor's profile (requires JWT token).

```bash
curl -X GET http://localhost:3000/api/vendors/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "vendor": {
    "_id": "507f1f77bcf86cd799439011",
    "vendorName": "John Doe",
    "mobile": "1234567890",
    ...
  }
}
```

#### 5. Update Current Vendor Profile

Update the authenticated vendor's profile with partial data and optional file uploads.

```bash
curl -X PATCH http://localhost:3000/api/vendors/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "businessName=Updated Business Name" \
  -F "selectedServices=[\"New Service\",\"Another Service\"]" \
  -F "profile=@/path/to/new-profile.jpg"
```

**Response:**
```json
{
  "message": "Vendor updated successfully",
  "vendor": { ... }
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T10:00:00.000Z",
  "uptime": 123.456
}
```

## Data Models

### Vendor Schema

```javascript
{
  vendorName: String (required),
  mobile: String (required, unique),
  mobileVerified: Boolean (default: false),
  gender: String (enum: 'male', 'female', 'other', ''),
  businessName: String,
  businessAddress: String,
  businessType: String (indexed),
  selectedServices: [String],
  identityImages: {
    profile: String,
    id: String,
    cert: String
  },
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `mobile` (unique)
- `businessType` (indexed for faster queries)

## File Uploads

### Current Implementation: Local Storage

Files are stored in the `uploads/` directory using Multer.

**Constraints:**
- Accepted formats: `jpeg`, `jpg`, `png`, `webp`
- Max file size: **25MB** per file
- Fields: `profile`, `id`, `cert`

**Accessing uploaded files:**
```
http://localhost:3000/uploads/filename.jpg
```

### Switching to S3/GCS (Future)

To switch from local storage to cloud storage:

1. Create `utils/storageAdapter.js`:
```javascript
// Example S3 adapter
async function uploadFile(file, folder) {
  // Use AWS SDK to upload to S3
  // Return public URL
}
```

2. Update `middleware/upload.js`:
```javascript
// Replace multer.diskStorage with multer.memoryStorage
// Call storageAdapter.uploadFile() in route handlers
```

3. Update route handlers in `routes/vendors.js`:
```javascript
// Instead of saving local paths, save S3 URLs
```

**NOTE**: Local file uploads are **not suitable for serverless deployments** (e.g., Vercel, AWS Lambda). Use a standard Node.js host (e.g., DigitalOcean, Heroku, Railway) or switch to S3/GCS.

## Authentication Flow

1. **Send OTP**: Client sends mobile number → Server generates 4-digit OTP → OTP stored in-memory (logged to console)
2. **Verify OTP**: Client sends mobile + OTP → Server verifies → Issues JWT token
   - If vendor exists: Returns vendor data + token with `vendorId`
   - If vendor doesn't exist: Returns token with `mobile` only
3. **Create Vendor**: Client sends vendor data with token → Server creates vendor → Returns vendor + updated token
4. **Protected Routes**: Client includes `Authorization: Bearer <token>` → Server validates JWT → Grants access

## Security Notes

### Development vs Production

**Current setup is for DEVELOPMENT:**
- OTP is stored in-memory (not suitable for multi-instance deployments)
- OTP is logged to console
- JWT secret should be a strong, random value in production

**For Production:**
- Replace in-memory OTP store with **Redis** or similar distributed cache
- Integrate real SMS provider (Twilio, AWS SNS, etc.)
- Use environment-specific secrets (never commit `.env` to version control)
- Add rate limiting for OTP endpoints
- Add request validation and sanitization
- Enable HTTPS
- Consider adding refresh tokens

### TODO: Production Hardening

See inline comments in the code marked with `TODO:` for areas requiring production hardening:
- `utils/otpStore.js`: Replace with Redis for multi-instance deployments
- `middleware/upload.js`: Swap local storage with S3/GCS adapter
- Add rate limiting middleware
- Add request validation with libraries like Joi or express-validator
- Add logging with Winston or similar
- Add monitoring/error tracking (Sentry, etc.)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/vendor-db` |
| `JWT_SECRET` | Secret key for JWT signing | `dev-secret-key` |
| `UPLOAD_DIR` | Directory for file uploads | `uploads` |

## Deployment

### 🚀 Render (Recommended - Socket.IO Support)

**Best for:** Real-time features, WebSockets, traditional server architecture

**Quick Deploy:**
1. See **[RENDER_SETUP.md](./RENDER_SETUP.md)** for complete guide
2. Push code to GitHub/GitLab
3. Connect to [Render](https://dashboard.render.com)
4. Configure environment variables (see `.env.render.template`)
5. Deploy!

**Key Features:**
- ✅ Socket.IO fully supported
- ✅ WebSockets work out of the box
- ✅ Persistent storage available (paid)
- ✅ Always-on option ($7/mo Starter plan)

**Resources:**
- [RENDER_SETUP.md](./RENDER_SETUP.md) - Complete setup guide
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migrate from Vercel
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist

### Standard Node.js Hosting

Also works on:
- **DigitalOcean App Platform**
- **Railway**
- **AWS EC2 / Elastic Beanstalk**
- **Google Cloud Run** (with persistent storage)

Steps:
1. Set environment variables on your platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud DB)
3. Deploy code
4. Server will auto-create `uploads/` directory

### Serverless Platforms (Vercel, AWS Lambda)

⚠️ **Limitations on serverless:**
- ❌ Socket.IO not supported
- ❌ WebSockets not available
- ❌ Local file uploads won't work (ephemeral filesystem)
- ❌ Long-running connections limited

**Recommendation:** Use Render for full feature support, or switch to S3/GCS for file storage if you must use serverless.

## Testing with Postman

1. Import the API endpoints from this README
2. Set up environment variables in Postman:
   - `BASE_URL`: `http://localhost:3000`
   - `TOKEN`: (save after verify-otp response)
3. Test the flow: send-otp → verify-otp → create vendor → get/update vendor

## Module 3: Payment & OTP Features

### Payment Request API

Request payment from customer for additional charges.

```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID/payment-request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150,
    "currency": "INR",
    "notes": "Additional materials",
    "autoConfirm": false
  }'
```

### OTP Verification for Order Completion

**1. Request OTP:**
```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID/request-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "arrival",
    "ttlSeconds": 300
  }'
```

**2. Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID/verify-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456",
    "purpose": "arrival"
  }'
```

**Order Status Flow:**
- `pending` → `assigned` → `accepted` → `in_progress` → `arrival_confirmed` → `completed`
- New statuses: `payment_requested`, `payment_confirmed`, `arrival_confirmed`

For full Module 3 API documentation, see `patches/structure_server/Server_v3.md`.

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Ensure MongoDB is running. Start it with `mongod` or check your `MONGO_URI` in `.env`.

### File Upload Error: "LIMIT_FILE_SIZE"

```
File too large. Maximum size is 25MB
```

**Solution**: Reduce file size or increase `maxFileSize` in `config/index.js`.

### JWT Verification Failed

```
Invalid or expired token
```

**Solution**: Token may be expired (30 days by default). Request a new token via verify-otp.

### Vendor Already Exists (409 Conflict)

```
Vendor with this mobile number already exists
```

**Solution**: Mobile number must be unique. Use a different number or update existing vendor via PATCH `/api/vendors/me`.

## Integration into Existing Projects

This backend is designed to be modular and easy to integrate:

1. Copy the entire `backend_server/` directory into your project
2. Run `npm install` in the directory
3. Configure `.env` with your settings
4. Start the server with `npm run dev`
5. Your existing frontend/mobile app can call these APIs

**No hardcoded paths** - all paths use environment variables and `path.join()`.

## License

ISC

## Support

For issues or questions, please refer to the inline code comments or extend functionality as needed. This server is designed to be flexible and modular for easy customization.

---

**Happy Coding!** 🚀
# vendor-backend
# vendor-backend
