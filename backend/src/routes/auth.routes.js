/**
 * =================================================================
 * AUTHENTICATION ROUTES - ĐỊNH TUYẾN XÁC THỰC
 * =================================================================
 * 
 * File này quản lý các route liên quan đến xác thực người dùng:
 * - Đăng ký tài khoản
 * - Đăng nhập
 * - Làm mới token
 * - Đăng xuất
 * - Quên mật khẩu
 * - Đặt lại mật khẩu
 * 
 * Tất cả routes đều có giới hạn tốc độ để bảo mật
 * =================================================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, authSchemas } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /auth/register - Đăng ký tài khoản mới
// Middleware: authLimiter (giới hạn tốc độ), validate (kiểm tra dữ liệu)
router.post('/register', authLimiter, validate(authSchemas.register), authController.register);

// POST /auth/login - Đăng nhập hệ thống
// Middleware: authLimiter (giới hạn tốc độ), validate (kiểm tra email/password)
router.post('/login', authLimiter, validate(authSchemas.login), authController.login);

// POST /auth/refresh-token - Làm mới access token
// Sử dụng refresh token để lấy access token mới khi token cũ hết hạn
router.post('/refresh-token', validate(authSchemas.refreshToken), authController.refreshToken);

// POST /auth/logout - Đăng xuất (xử lý phía client)
// Xóa token khỏi client storage, không cần xử lý phía server
router.post('/logout', authController.logout);

// POST /auth/forgot-password - Yêu cầu đặt lại mật khẩu
// Gửi email chứa link/token để reset password
router.post(
  '/forgot-password',
  authLimiter,
  validate(authSchemas.forgotPassword),
  authController.forgotPassword,
);

// POST /auth/reset-password - Đặt lại mật khẩu với token
// Sử dụng token từ email để thiết lập mật khẩu mới
router.post(
  '/reset-password',
  authLimiter,
  validate(authSchemas.resetPassword),
  authController.resetPassword,
);

module.exports = router;
