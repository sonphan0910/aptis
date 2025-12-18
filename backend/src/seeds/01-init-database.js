require('dotenv').config();
const { sequelize } = require('../config/database');

/**
 * Initialize database - drop and recreate all tables
 */
async function initDatabase() {
  try {
    console.log('[Seed] Initializing database...');
    console.log('[Seed] WARNING: This will drop all existing tables!');

    // Sync database with force: true to drop and recreate tables
    await sequelize.sync({ force: true });

    console.log('[Seed] Database initialized successfully');
    console.log('[Seed] All tables created');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Failed to initialize database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
