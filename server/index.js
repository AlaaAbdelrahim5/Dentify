require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Attach Prisma client to request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dentify API is running',
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

const PORT = process.env.PORT || 5000;

// Import sequence sync utilities
const { syncUserSequence } = require('./utils/sequenceSync');

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
    const connectionTimeout = setTimeout(() => {
      console.error('❌ Database connection timeout (10s)');
      process.exit(1);
    }, 10000);
    
    await prisma.$connect();
    clearTimeout(connectionTimeout);
    console.log(`✅ Database connected successfully`);
    
    // Sync database sequences to prevent ID conflicts (non-blocking)
    syncUserSequence(prisma).catch(err => {
      console.warn('⚠️ Sequence sync failed (non-critical):', err.message);
    });
    
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
});

module.exports = app;
