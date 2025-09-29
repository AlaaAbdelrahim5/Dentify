const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB, getConnectionStatus } = require('./config/database');
const DatabaseHealthCheck = require('./utils/dbHealthCheck');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('🚀 Database initialization completed');
  } catch (error) {
    console.error('💥 Failed to initialize database:', error.message);
    process.exit(1);
  }
};

// Initialize database connection
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Dentify Server is running!' });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const dbStatus = getConnectionStatus();
    const dbPing = await DatabaseHealthCheck.ping();
    const connectionInfo = DatabaseHealthCheck.getConnectionInfo();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        connected: dbStatus === 'Connected',
        ping: dbPing,
        connection: connectionInfo
      },
      server: {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database status route
app.get('/api/database/status', async (req, res) => {
  try {
    const dbStatus = getConnectionStatus();
    const dbPing = await DatabaseHealthCheck.ping();
    const dbStats = await DatabaseHealthCheck.getStats();
    const connectionInfo = DatabaseHealthCheck.getConnectionInfo();
    
    res.json({
      database: {
        status: dbStatus,
        connected: dbStatus === 'Connected',
        ping: dbPing,
        stats: dbStats,
        connection: connectionInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Database status: http://localhost:${PORT}/api/database/status`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});