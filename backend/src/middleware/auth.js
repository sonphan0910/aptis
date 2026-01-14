// ============================================================
// Middleware xác thực JWT cho các route cần đăng nhập
// ============================================================
const jwt = require('jsonwebtoken');
const JWT_CONFIG = require('../config/jwt');
const { User } = require('../models');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware bắt buộc: kiểm tra token JWT hợp lệ
 * Nếu hợp lệ sẽ gán thông tin user vào req.user
 * Nếu không hợp lệ sẽ ném UnauthorizedError
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization (định dạng: "Bearer <token>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Không tìm thấy token');
    }

    // Cắt chuỗi 'Bearer ' (7 ký tự) để lấy token thực sự
    const token = authHeader.substring(7);

    // Giải mã (decode) và xác thực (verify) token bằng secret key
    const decoded = jwt.verify(token, JWT_CONFIG.secret);

    // Kiểm tra loại token (chỉ chấp nhận access token, không chấp nhận refresh token)
    if (decoded.type !== JWT_CONFIG.tokenTypes.ACCESS) {
      throw new UnauthorizedError('Token không hợp lệ');
    }

    // Tìm user trong database theo userId lưu trong token
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('Không tìm thấy người dùng');
    }

    // Kiểm tra user có hoạt động hay không
    if (user.status !== 'active') {
      throw new UnauthorizedError('Tài khoản đã bị khoá hoặc chưa kích hoạt');
    }

    // Gán thông tin user vào request object để các middleware/route sau sử dụng
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    };

    next();
  } catch (error) {
    // Xử lý các lỗi JWT cụ thể
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional auth - không yêu cầu token nhưng sẽ lấy thông tin user nếu có token hợp lệ
 * Dùng cho các route công khai nhưng có tính năng khác nhau cho user đã đăng nhập
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Nếu không có token thì bỏ qua
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_CONFIG.secret);

    // Chỉ lấy thông tin user nếu token là access token hợp lệ
    if (decoded.type === JWT_CONFIG.tokenTypes.ACCESS) {
      const user = await User.findByPk(decoded.userId);

      // Chỉ gán user nếu tài khoản đang hoạt động
      if (user && user.status === 'active') {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        };
      }
    }

    next();
  } catch (error) {
    // Bỏ qua lỗi token trong optional auth, vẫn cho phép request tiếp tục
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };
