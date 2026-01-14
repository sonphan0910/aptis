require('dotenv').config();
const { sequelize } = require('../config/database');
// Import tất cả models để Sequelize biết cần tạo những bảng nào
require('../models');

/**
 * Khởi tạo database - Xóa và tạo lại tất cả các bảng
 * Initialize database - drop and recreate all tables
 */
async function initDatabase() {
  try {

    // Bắt đầu khởi tạo database
    console.log('[Seed] Đang khởi tạo database...');
    console.log('[Seed] CẢNH BÁO: Lệnh này sẽ xóa toàn bộ bảng hiện có!');


    // Đồng bộ database với force: true để xóa và tạo lại bảng
    await sequelize.sync({ force: true });


    // Khởi tạo thành công
    console.log('[Seed] Đã khởi tạo database thành công');
    console.log('[Seed] Đã tạo tất cả các bảng');

    process.exit(0);
  } catch (error) {

    // Lỗi khi khởi tạo database
    console.error('[Seed] Lỗi khởi tạo database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
