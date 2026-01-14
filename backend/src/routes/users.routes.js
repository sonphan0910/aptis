/**
 * =================================================================
 * USER ROUTES - ĐỊNH TUYẾN NGƯỜI DÙNG
 * =================================================================
 * 
 * File này quản lý các route liên quan đến người dùng:
 * - Quản lý profile cá nhân (xem, cập nhật, đổi mật khẩu, upload avatar)
 * - Quản lý người dùng cho Admin (CRUD operations)
 * 
 * Phân quyền:
 * - Profile: Yêu cầu đăng nhập (authMiddleware)
 * - Admin: Yêu cầu quyền admin (authMiddleware + isAdmin)
 * =================================================================
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validate, userSchemas } = require('../middleware/validation');
const { apiLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../config/storage');

// =====================================
// QUẢN LÝ PROFILE CÁ NHÂN
// =====================================

// GET /users/profile - Lấy thông tin profile của user hiện tại
router.get('/profile', authMiddleware, userController.getProfile);

// PUT /users/profile - Cập nhật thông tin profile
// Middleware: authMiddleware (yêu cầu đăng nhập), validate (kiểm tra dữ liệu)
router.put(
  '/profile',
  authMiddleware,
  validate(userSchemas.updateProfile),
  userController.updateProfile,
);

// POST /users/change-password - Đổi mật khẩu
// User phải nhập mật khẩu cũ và mật khẩu mới
router.post(
  '/change-password',
  authMiddleware,
  validate(userSchemas.changePassword),
  userController.changePassword,
);

// POST /users/profile/avatar - Upload ảnh đại diện
// Middleware: uploadLimiter (giới hạn upload), upload.single (xử lý file)
router.post(
  '/profile/avatar',
  authMiddleware,
  uploadLimiter,
  upload.single('avatar'),
  userController.uploadAvatar,
);

// =====================================
// QUẢN LÝ NGƯỜI DÙNG (ADMIN)
// =====================================

// GET /users/admin/users - Lấy danh sách tất cả người dùng (Admin only)
router.get('/admin/users', authMiddleware, isAdmin, apiLimiter, userController.getAllUsers);

// POST /users/admin/users - Tạo tài khoản người dùng mới (Admin only)
router.post(
  '/admin/users',
  authMiddleware,
  isAdmin,
  validate(userSchemas.createUser),
  userController.createUser,
);

// PUT /users/admin/users/:userId - Cập nhật thông tin người dùng (Admin only)
router.put(
  '/admin/users/:userId',
  authMiddleware,
  isAdmin,
  validate(userSchemas.updateUser),
  userController.updateUser,
);

// DELETE /users/admin/users/:userId - Xóa người dùng (Admin only)
router.delete('/admin/users/:userId', authMiddleware, isAdmin, userController.deleteUser);

// POST /users/admin/users/:userId/reset-password - Đặt lại mật khẩu cho người dùng (Admin only)
router.post(
  '/admin/users/:userId/reset-password',
  authMiddleware,
  isAdmin,
  userController.resetUserPassword,
);

module.exports = router;
