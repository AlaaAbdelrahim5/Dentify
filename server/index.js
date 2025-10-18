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
    // Test database connection on startup
    await prisma.$connect();
    console.log(`✅ Database connected successfully`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
});

module.exports = app;
