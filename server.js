const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const config = require('./config');
// Socket.IO disabled for Vercel serverless deployment
// const { initializeSocket } = require('./services/socketService');

// Import routes
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendors');
const workTypesRoutes = require('./routes/workTypes');
const vendorLocationRoutes = require('./routes/vendorLocation');
const presenceRoutes = require('./routes/presence');
const orderRoutes = require('./routes/orders');
const ordersFetchListRoutes = require('./routes/ordersFetchList');
const earningsRoutes = require('./routes/earnings');
const proxyRoutes = require('./routes/proxy');
const vendorAuthRoutes = require('./routes/vendorAuth');
const vendorBookingRoutes = require('./routes/vendorBooking');
const { seedWorkTypes } = require('./controllers/workTypesController');

// Initialize Express app
const app = express();

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);
// Initialize Socket.IO when explicitly enabled
if (process.env.ENABLE_SOCKET_IO === 'true') {
  try {
    const { initializeSocket } = require('./services/socketService');
    initializeSocket(server);
  } catch (e) {
    console.warn('Socket.IO initialization skipped:', e.message);
  }
}

// Create uploads directory if it doesn't exist (skip on serverless environments)
const uploadsPath = path.join(__dirname, config.uploadDir);
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`Created uploads directory: ${uploadsPath}`);
  }
} catch (error) {
  // On serverless platforms (like Vercel), filesystem is read-only
  console.warn('Cannot create uploads directory (serverless environment):', error.message);
  console.warn('File uploads will not persist. Consider using cloud storage (S3/Cloudinary).');
}

// Trust proxy - Required for Vercel deployment
// This enables Express to trust the X-Forwarded-* headers from Vercel's proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware - logs ALL incoming requests (AFTER body parsing)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n========================================`);
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log(`[REQUEST] IP: ${req.ip}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[REQUEST] Body:`, JSON.stringify(req.body, null, 2));
  }
  console.log(`========================================\n`);
  next();
});

// Static file serving for uploads
// Files will be accessible at http://localhost:PORT/uploads/filename
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendors', presenceRoutes); // Presence routes under /api/vendors
if (config.enableWorkTypes) {
  app.use('/api/work-types', workTypesRoutes);
  app.use('/api', workTypesRoutes); // For /api/vendors/me/work-types
} else {
  console.log('ℹ️  Work-types API disabled (set ENABLE_WORK_TYPES=true to enable)');
}
app.use('/api/orders', ordersFetchListRoutes); // Order fetchlist endpoints (must be BEFORE orderRoutes)
app.use('/api/orders', orderRoutes); // Order management routes
app.use('/api/earnings', earningsRoutes); // Earnings endpoints
app.use('/api/proxy', proxyRoutes); // Backend-to-backend proxy endpoints
app.use('/api/booking', require('./routes/booking')); // Vendor booking action routes
app.use('/api/vendor/bookings', require('./routes/booking')); // Also mount at /api/vendor/bookings for pending endpoint
// Vendor location endpoint mounted at /api/vendor/location
app.use('/api/vendor', vendorLocationRoutes);

// NEW: Vendor-specific routes (separate from /api/*)
app.use('/vendor', vendorAuthRoutes); // Vendor auth: /vendor/register, /vendor/verify-otp, /vendor/update-fcm-token, /vendor/update-location
app.use('/vendor', vendorBookingRoutes); // Vendor bookings: /vendor/api/new-booking, /vendor/booking/update-status

// Conditionally mount dev/mock endpoints (only when ENABLE_MOCK_ORDERS=true)
if (config.enableMockOrders) {
  console.log('⚠️  Mock order endpoint enabled (ENABLE_MOCK_ORDERS=true)');
  if (!config.mockOrdersSecret) {
    console.warn('⚠️  WARNING: MOCK_ORDERS_SECRET not set. Mock endpoints are vulnerable!');
  }
  const devOrdersRoutes = require('./routes/devOrders');
  app.use('/api/dev', devOrdersRoutes);
} else {
  console.log('ℹ️  Mock order endpoint disabled (set ENABLE_MOCK_ORDERS=true to enable)');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Vendor Backend API',
    version: '2.0.0',
    endpoints: {
      vendor: {
        register: 'POST /vendor/register',
        verifyOtp: 'POST /vendor/verify-otp',
        updateFcmToken: 'POST /vendor/update-fcm-token',
        updateLocation: 'POST /vendor/update-location',
        newBooking: 'POST /vendor/api/new-booking (server-to-server)',
        updateBookingStatus: 'POST /vendor/booking/update-status',
      },
      auth: {
        sendOtp: 'POST /api/auth/send-otp',
        verifyOtp: 'POST /api/auth/verify-otp',
      },
      vendors: {
        create: 'POST /api/vendors',
        getMe: 'GET /api/vendors/me',
        updateMe: 'PATCH /api/vendors/me'
      },
      bookings: {
        accept: 'POST /api/booking/accept',
        reject: 'POST /api/booking/reject',
        start: 'POST /api/booking/start',
        complete: 'POST /api/booking/complete',
        pending: 'GET /api/vendor/bookings/pending',
      },
      workTypes: {
        getAll: 'GET /api/work-types',
      },
      health: 'GET /health',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Database connection (skip automatic connect during tests; tests manage their own in-memory DB)
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(config.mongoUri)
    .then(async () => {
      console.log('Connected to MongoDB');
      console.log(`Database: ${config.mongoUri}`);
      
      // Drop problematic vendorId index if it exists
      try {
        const collection = mongoose.connection.db.collection('vendors');
        await collection.dropIndex('vendorId_1');
        console.log('✅ Dropped vendorId_1 index');
      } catch (error) {
        if (error.code === 27 || error.message?.includes('index not found')) {
          console.log('✅ vendorId_1 index does not exist');
        } else {
          console.warn('⚠️  Could not drop vendorId_1 index:', error.message);
        }
      }
      
      // Seed work types if database is empty
      seedWorkTypes();

      // Initialize Firebase Admin SDK (require lazily so tests can mock the module)
      try {
        const { initializeFirebase } = require('./config/firebase');
        initializeFirebase();
      } catch (e) {
        console.warn('Firebase initialization skipped or failed:', e.message);
      }
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
} else {
  console.log('Test environment detected — skipping automatic mongoose.connect.');
}

// Mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  
  // Socket.IO disabled for serverless
  // No persistent connections to close
  
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Decide whether to start the HTTP server
// For Render/traditional hosting: always listen
// For Vercel serverless: skip listening (Vercel handles it)
// For tests: skip unless explicitly enabled
const shouldListen =
  process.env.VERCEL !== '1' &&
  process.env.NODE_ENV !== 'production-serverless' &&
  (process.env.NODE_ENV !== 'test' || process.env.ENABLE_SOCKET_IO === 'true' || process.env.ENABLE_TEST_SERVER === '1');

if (shouldListen) {
  const PORT = config.port;
  server.listen(PORT, '0.0.0.0', () => {
    const isRender = process.env.RENDER === 'true';
    const platform = isRender ? 'Render' : 'Local';
    
    console.log(`\n🚀 Server running on ${platform} - Port ${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsPath}`);
    console.log(`🔗 API: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    
    if (config.enableSocketIO) {
      console.log(`⚡ Socket.IO enabled and ready`);
    } else {
      console.log('ℹ️  Socket.IO disabled');
    }
    
    console.log('📲 Firebase Cloud Messaging configured for push notifications');
    console.log('');
  });
} else {
  if (process.env.NODE_ENV === 'test') {
    console.log('Test environment detected — not starting HTTP listener (unless enabled)');
  }
  if (process.env.VERCEL === '1') {
    console.log('Vercel serverless environment detected — exporting app for serverless function');
  }
}

// Export app for serverless platforms (Vercel) and testing
// Traditional hosting (Render) uses server.listen() above
// Export `app` for Supertest and also expose `server` for integration tests
module.exports = app;
module.exports.app = app;
module.exports.server = server;
