// ============================================================
// Middleware xử lý lỗi tổng cho toàn bộ hệ thống
// ============================================================
const {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} = require('../utils/errors');

/**
 * Middleware xử lý lỗi (bắt buộc đặt sau tất cả các route)
 * Tự động trả về lỗi chuẩn JSON cho client theo loại lỗi
 * Thứ tự xử lý: ValidationError -> NotFoundError -> UnauthorizedError -> ForbiddenError
 *             -> ConflictError -> AppError -> SequelizeErrors -> JWTErrors -> Generic error
 */
const errorHandler = (err, req, res, next) => {
    // Xử lý lỗi ValidationError (lỗi validate custom do dev định nghĩa)
    if (err instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
          code: err.code || 'VALIDATION_ERROR',
          details: err.details || undefined, // Danh sách chi tiết các lỗi field
        },
      });
    }

    // Xử lý lỗi NotFoundError (không tìm thấy dữ liệu yêu cầu)
    if (err instanceof NotFoundError) {
      return res.status(404).json({
        success: false,
        error: {
          message: err.message,
          code: err.code || 'NOT_FOUND',
        },
      });
    }

    // Xử lý lỗi UnauthorizedError (chưa đăng nhập hoặc token hết hạn)
    if (err instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        error: {
          message: err.message,
          code: err.code || 'UNAUTHORIZED',
        },
      });
    }

    // Xử lý lỗi ForbiddenError (user không đủ quyền truy cập)
    if (err instanceof ForbiddenError) {
      return res.status(403).json({
        success: false,
        error: {
          message: err.message,
          code: err.code || 'FORBIDDEN',
        },
      });
    }

    // Xử lý lỗi ConflictError (xung đột dữ liệu, VD: email đã tồn tại)
    if (err instanceof ConflictError) {
      return res.status(409).json({
        success: false,
        error: {
          message: err.message,
          code: err.code || 'CONFLICT',
        },
      });
    }

    // Xử lý các lỗi custom AppError (lỗi nghiệp vụ do dev định nghĩa)
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          message: err.message,
          code: err.code,
          // Chỉ trả về stack trace ở môi trường dev để debug
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
      });
    }

    // Xử lý lỗi validate của Sequelize (lỗi dữ liệu đầu vào không hợp lệ)
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: {
          message: 'Dữ liệu không hợp lệ',
          code: 'VALIDATION_ERROR',
          details: errors,
        },
      });
    }

    // Xử lý lỗi trùng lặp unique constraint của Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0]?.path || 'field';
      return res.status(409).json({
        success: false,
        error: {
          message: `${field} already exists`,
          code: 'DUPLICATE_ERROR',
          field,
        },
      });
    }

    // Xử lý lỗi foreign key constraint của Sequelize
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid reference to related resource',
          code: 'FOREIGN_KEY_ERROR',
        },
      });
    }

    // Xử lý lỗi multer file upload - file quá lớn
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File size too large',
          code: 'FILE_SIZE_ERROR',
        },
      });
    }

    // Xử lý lỗi multer file upload - loại file không được phép
    if (err.message && err.message.includes('File type not allowed')) {
      return res.status(400).json({
        success: false,
        error: {
          message: err.message,
          code: 'FILE_TYPE_ERROR',
        },
      });
    }

    // Xử lý lỗi JWT - token sai định dạng
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        },
      });
    }

    // Xử lý lỗi JWT - token đã hết hạn
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      });
    }

    // Log lỗi không xác định (chỉ ở production)
    if (process.env.NODE_ENV === 'production') {
      console.error('Unhandled error:', err);
    }

    // Xử lý các lỗi không xác định
    return res.status(500).json({
      success: false,
      error: {
        // Ở production không tiết lộ chi tiết lỗi, ở dev thì hiển thị
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        code: 'INTERNAL_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
};

/**
 * Middleware xử lý 404 Not Found
 * Dùng cho các route không tồn tại
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};

module.exports = { errorHandler, notFoundHandler };
