const mongoose = require('mongoose');

// Database health check utility
class DatabaseHealthCheck {
  static async ping() {
    try {
      // Simple ping to check if database is responsive
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        message: 'Database is responsive',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  static async getStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        status: 'healthy',
        stats: {
          database: stats.db,
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes,
          objects: stats.objects
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  static getConnectionInfo() {
    const connection = mongoose.connection;
    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name,
      readyStateText: this.getReadyStateText(connection.readyState)
    };
  }

  static getReadyStateText(state) {
    const states = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    return states[state] || 'Unknown';
  }
}

module.exports = DatabaseHealthCheck;