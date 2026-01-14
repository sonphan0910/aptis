
// Cấu hình JWT cho xác thực người dùng
require('dotenv').config();

const JWT_CONFIG = {
  // Chuỗi bí mật dùng để ký JWT (nên đổi khi lên production)
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',

  // Thời gian hết hạn của access token (mặc định 24h)
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Thời gian hết hạn của refresh token (mặc định 7 ngày)
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // Các loại token sử dụng trong hệ thống
  tokenTypes: {
    ACCESS: 'access',           // Token truy cập
    REFRESH: 'refresh',         // Token làm mới
    RESET_PASSWORD: 'reset_password', // Token dùng cho chức năng quên mật khẩu
  },

  // Cấu hình cookie cho refresh token
  cookieOptions: {
    httpOnly: true,                                 // Chỉ cho phép truy cập qua HTTP, không qua JS
    secure: process.env.NODE_ENV === 'production',  // Chỉ dùng cookie ở môi trường production
    sameSite: 'strict',                            // Chỉ gửi cookie cùng site
    maxAge: 7 * 24 * 60 * 60 * 1000,               // Thời gian sống cookie: 7 ngày
  },
};

// Export cấu hình JWT
module.exports = JWT_CONFIG;
