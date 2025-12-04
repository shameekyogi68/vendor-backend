# Booking Management API Documentation

## Base URL
```
https://vendor-backend-7cn3.onrender.com
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Accept/Reject Booking
**Endpoint:** `PATCH /api/booking/update-status`

**Description:** Vendor can accept or reject a pending booking. When accepted, generates a 4-digit OTP for job start.

**Request Body:**
```json
{
  "vendorId": "vendor_object_id",
  "bookingId": "unique_booking_id",
  "status": "accepted" // or "rejected"
}
```

**Success Response (Accept):**
```json
{
  "ok": true,
  "message": "Booking accepted successfully",
  "booking": {
    "bookingId": "B12345",
    "status": "accepted",
    "otpStart": "4567"
  }
}
```

**Success Response (Reject):**
```json
{
  "ok": true,
  "message": "Booking rejected successfully",
  "booking": {
    "bookingId": "B12345",
    "status": "rejected",
    "otpStart": null
  }
}
```

**Error Responses:**
- `400` - Invalid status or booking already processed
- `404` - Booking not found
- `500` - Server error

**Frontend Implementation:**
```javascript
async function updateBookingStatus(vendorId, bookingId, status) {
  try {
    const response = await fetch('https://vendor-backend-7cn3.onrender.com/api/booking/update-status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourJwtToken}`
      },
      body: JSON.stringify({
        vendorId,
        bookingId,
        status // "accepted" or "rejected"
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('Booking updated:', data.booking);
      if (status === 'accepted') {
        // Save OTP to show customer later
        console.log('Start OTP:', data.booking.otpStart);
      }
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Update booking error:', error);
    throw error;
  }
}

// Usage
await updateBookingStatus(vendorId, 'B12345', 'accepted');
```

---

### 2. Start Job
**Endpoint:** `POST /api/booking/start-job`

**Description:** Start a job by verifying the OTP. Customer provides the OTP to vendor, vendor enters it to start the job.

**Request Body:**
```json
{
  "bookingId": "unique_booking_id",
  "otp": "4567"
}
```

**Success Response:**
```json
{
  "ok": true,
  "message": "Job started successfully",
  "booking": {
    "bookingId": "B12345",
    "status": "started"
  }
}
```

**Error Responses:**
- `400` - Invalid OTP, OTP already used, or booking not in accepted status
- `404` - Booking not found
- `500` - Server error

**Frontend Implementation:**
```javascript
async function startJob(bookingId, otp) {
  try {
    const response = await fetch('https://vendor-backend-7cn3.onrender.com/api/booking/start-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourJwtToken}`
      },
      body: JSON.stringify({
        bookingId,
        otp
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('Job started:', data.booking);
      return data;
    } else {
      // Handle specific errors
      if (data.error === 'Invalid OTP') {
        alert('Wrong OTP. Please try again.');
      } else if (data.error === 'OTP already used') {
        alert('This job has already been started.');
      }
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Start job error:', error);
    throw error;
  }
}

// Usage
await startJob('B12345', '4567');
```

---

### 3. Complete Job
**Endpoint:** `PATCH /api/booking/complete-job`

**Description:** Mark a job as completed after the work is done.

**Request Body:**
```json
{
  "bookingId": "unique_booking_id",
  "status": "completed"
}
```

**Success Response:**
```json
{
  "ok": true,
  "message": "Job completed successfully",
  "booking": {
    "bookingId": "B12345",
    "status": "completed"
  }
}
```

**Error Responses:**
- `400` - Booking not in started status
- `404` - Booking not found
- `500` - Server error

**Frontend Implementation:**
```javascript
async function completeJob(bookingId) {
  try {
    const response = await fetch('https://vendor-backend-7cn3.onrender.com/api/booking/complete-job', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourJwtToken}`
      },
      body: JSON.stringify({
        bookingId,
        status: 'completed'
      })
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('Job completed:', data.booking);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Complete job error:', error);
    throw error;
  }
}

// Usage
await completeJob('B12345');
```

---

### 4. Get Vendor Bookings
**Endpoint:** `GET /api/booking/vendor/:vendorId`

**Description:** Fetch all bookings for a vendor, optionally filtered by status.

**Query Parameters:**
- `status` (optional): Filter by status - pending, accepted, rejected, started, completed, cancelled

**Request:**
```
GET /api/booking/vendor/507f1f77bcf86cd799439011?status=pending
Authorization: Bearer <your_jwt_token>
```

**Success Response:**
```json
{
  "ok": true,
  "bookings": [
    {
      "_id": "...",
      "bookingId": "B12345",
      "customerId": "C123",
      "vendorId": "507f1f77bcf86cd799439011",
      "serviceType": "Plumbing",
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "customerAddress": "123 Main St",
      "scheduledTime": "2025-12-05T10:00:00.000Z",
      "status": "pending",
      "otpStart": null,
      "otpUsed": false,
      "createdAt": "2025-12-04T10:00:00.000Z",
      "updatedAt": "2025-12-04T10:00:00.000Z"
    }
  ]
}
```

**Frontend Implementation:**
```javascript
async function getVendorBookings(vendorId, status = null) {
  try {
    let url = `https://vendor-backend-7cn3.onrender.com/api/booking/vendor/${vendorId}`;
    if (status) {
      url += `?status=${status}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${yourJwtToken}`
      }
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('Bookings:', data.bookings);
      return data.bookings;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    throw error;
  }
}

// Usage
const allBookings = await getVendorBookings(vendorId);
const pendingBookings = await getVendorBookings(vendorId, 'pending');
```

---

## Booking Flow

### Complete Workflow

1. **New Booking Created** → Status: `pending`
   - Customer creates a booking from customer app
   - Vendor receives notification about new booking

2. **Vendor Accepts/Rejects** → Status: `accepted` or `rejected`
   ```javascript
   // Vendor accepts
   await updateBookingStatus(vendorId, bookingId, 'accepted');
   // Response contains otpStart: "4567"
   ```
   - If accepted: 4-digit OTP generated and sent to customer
   - Customer receives FCM notification with OTP

3. **Vendor Arrives & Starts Job** → Status: `started`
   ```javascript
   // Customer shows OTP to vendor, vendor enters it
   await startJob(bookingId, '4567');
   ```
   - Vendor enters OTP shown by customer
   - OTP verified, job status changes to started

4. **Vendor Completes Job** → Status: `completed`
   ```javascript
   await completeJob(bookingId);
   ```
   - Vendor marks job as complete
   - Customer receives completion notification

---

## Booking Status Flow

```
pending → accepted → started → completed
   ↓
rejected
```

**Status Meanings:**
- `pending`: Awaiting vendor response
- `accepted`: Vendor accepted, OTP generated
- `rejected`: Vendor rejected the booking
- `started`: Job in progress (OTP verified)
- `completed`: Job finished
- `cancelled`: Cancelled by customer (future)

---

## Error Handling

All endpoints return consistent error format:
```json
{
  "ok": false,
  "error": "Error message description",
  "message": "Detailed error message (optional)"
}
```

**Common Error Codes:**
- `400`: Bad request (invalid parameters, wrong status)
- `401`: Unauthorized (missing/invalid JWT token)
- `404`: Resource not found
- `500`: Internal server error

---

## FCM Notifications

The backend automatically sends FCM push notifications to customers at these stages:

1. **Booking Accepted**: Includes OTP in notification
2. **Booking Rejected**: Simple rejection notification
3. **Job Started**: Confirms vendor has started work
4. **Job Completed**: Confirms service completion

**Customer Notification Format:**
```json
{
  "notification": {
    "title": "Booking Accepted",
    "body": "Your booking has been accepted. OTP: 4567"
  },
  "data": {
    "type": "BOOKING_STATUS_UPDATE",
    "bookingId": "B12345",
    "status": "accepted",
    "otpStart": "4567"
  }
}
```

---

## Testing

### Test with cURL

**1. Accept Booking:**
```bash
curl -X PATCH https://vendor-backend-7cn3.onrender.com/api/booking/update-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "vendorId": "507f1f77bcf86cd799439011",
    "bookingId": "B12345",
    "status": "accepted"
  }'
```

**2. Start Job:**
```bash
curl -X POST https://vendor-backend-7cn3.onrender.com/api/booking/start-job \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bookingId": "B12345",
    "otp": "4567"
  }'
```

**3. Complete Job:**
```bash
curl -X PATCH https://vendor-backend-7cn3.onrender.com/api/booking/complete-job \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bookingId": "B12345",
    "status": "completed"
  }'
```

---

## Frontend Integration Checklist

- [ ] Store JWT token securely after vendor login
- [ ] Implement accept/reject buttons in booking card
- [ ] Show OTP to vendor after accepting booking
- [ ] Create OTP input screen for starting job
- [ ] Add "Mark Complete" button for started jobs
- [ ] Handle FCM notifications on customer side
- [ ] Display booking list with status filters
- [ ] Show real-time booking status updates
- [ ] Implement error handling for all API calls
- [ ] Add loading states during API calls

---

## Notes

- All times are in UTC. Convert to local timezone in frontend.
- OTP is 4 digits for job start verification.
- Each OTP can only be used once.
- Bookings can only move forward in status (no going back).
- JWT token expires after configured time (check with `/api/auth/verify-otp` response).
