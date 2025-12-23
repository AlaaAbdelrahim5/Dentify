require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
const bodyLimit = process.env.REQUEST_BODY_LIMIT;
app.use(express.json({ limit: bodyLimit })); // Increased limit for base64 images and medical files (DICOM)
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Note: Static file serving for uploads removed - images now stored in database as base64

// Attach Prisma client to request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: `${process.env.APP_NAME} API is running`,
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Config routes (Firebase config for service workers)
const configRoutes = require('./routes/config');
app.use('/api/config', configRoutes);

// User routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Upload routes
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

// Admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
app.use('/api/admins', adminRoutes); // Alias for frontend compatibility

// Clinic routes
const clinicRoutes = require('./routes/clinics');
app.use('/api/clinics', clinicRoutes);

// Dentist routes
const dentistRoutes = require('./routes/dentists');
app.use('/api/dentists', dentistRoutes);

// Patient routes
const patientRoutes = require('./routes/patients');
app.use('/api/patients', patientRoutes);

// Secretary routes
const secretaryRoutes = require('./routes/secretaries');
app.use('/api/secretaries', secretaryRoutes);

// Radiology routes
const radiologyRoutes = require('./routes/radiology');
app.use('/api/radiology', radiologyRoutes);
app.use('/api/radiology-centers', radiologyRoutes); // Alias for frontend compatibility

// Appointment routes
const appointmentRoutes = require('./routes/appointments');
app.use('/api/appointments', appointmentRoutes);

// Treatment routes
const treatmentRoutes = require('./routes/treatments');
app.use('/api/treatments', treatmentRoutes);

// Payment routes
const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);

// Radiology Request routes
const radiologyRequestRoutes = require('./routes/radiologyRequests');
app.use('/api/radiology-requests', radiologyRequestRoutes);

// Notification routes
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

// Two-Factor Authentication routes
const twoFactorRoutes = require('./routes/twoFactor');
app.use('/api/2fa', twoFactorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT;

// Import sequence sync utilities
const { syncUserSequence } = require('./services/database/sequenceSync');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, async () => {
  try {
    console.log(`🚀 Server starting on port ${PORT}...`);
    
    // Test database connection on startup with timeout
    const dbTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT);
    const connectionTimeout = setTimeout(() => {
      console.error(`❌ Database connection timeout (${dbTimeout / 1000}s)`);
      process.exit(1);
    }, dbTimeout);
    
    await prisma.$connect();
    clearTimeout(connectionTimeout);
    console.log(`✅ Database connected successfully`);
    
    // Sync database sequences to prevent ID conflicts (non-blocking)
    syncUserSequence(prisma).catch(err => {
      console.warn('⚠️ Sequence sync failed (non-critical):', err.message);
    });
    
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
});

module.exports = app;
