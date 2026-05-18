require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { pool } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    logger.info('✅ PostgreSQL (Neon) connected successfully');

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 API Docs at http://localhost:${PORT}/api/docs`);
      logger.info(`🔍 Health check at http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing connections...');
  await pool.end();
  process.exit(0);
});

start();
