
// Cấu hình kết nối database sử dụng Sequelize
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Khởi tạo đối tượng Sequelize với thông tin từ biến môi trường hoặc giá trị mặc định
const sequelize = new Sequelize(
  process.env.DB_NAME || 'aptis_db',      // Tên database
  process.env.DB_USER || 'root',          // Tên user
  process.env.DB_PASSWORD || '123456',    // Mật khẩu
  {
    host: process.env.DB_HOST || 'localhost', // Địa chỉ host
    port: process.env.DB_PORT || 3306,        // Cổng kết nối
    dialect: 'mysql',                         // Loại CSDL
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL khi dev
    pool: {
      max: 10,    // Số kết nối tối đa
      min: 0,     // Số kết nối tối thiểu
      acquire: 30000, // Thời gian tối đa (ms) để lấy kết nối
      idle: 10000,    // Thời gian tối đa (ms) kết nối rảnh trước khi giải phóng
    },
    define: {
      timestamps: true,      // Tự động thêm trường created_at, updated_at
      underscored: true,     // Đặt tên trường dạng snake_case
      freezeTableName: true, // Không tự động đổi tên bảng số nhiều
    },
  },
);

/**
 * Hàm kiểm tra kết nối database
 * Nếu thành công sẽ log ra console, nếu lỗi sẽ dừng tiến trình
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công.');
  } catch (error) {
    console.error('❌ Không thể kết nối database:', error);
    process.exit(1);
  }
};

// Export các thành phần cần thiết
module.exports = {
  sequelize,      // Đối tượng Sequelize đã cấu hình
  Sequelize,      // Thư viện Sequelize gốc
  testConnection, // Hàm kiểm tra kết nối
};
