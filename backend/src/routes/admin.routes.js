/**
 * =================================================================
 * ADMIN ROUTES - ĐỊNH TUYẾN QUẢN TRỊ HỆ THỐNG
 * =================================================================
 * 
 * File này quản lý tất cả các route dành cho Admin:
 * - Quản lý người dùng (tạo, sửa, xóa, thống kê)
 * - Quản lý bài thi (duyệt, từ chối, thống kê)
 * - Báo cáo và phân tích hệ thống
 * - Cấu hình hệ thống và bảo trì
 * 
 * Tất cả routes yêu cầu:
 * - authMiddleware: Đã đăng nhập
 * - isAdmin: Có quyền admin
 * =================================================================
 */

const express = require('express');
const router = express.Router();
const UserManagementController = require('../controllers/adminController/userManagement');
const AdminExamController = require('../controllers/adminController/adminExamController');
const ReportController = require('../controllers/adminController/reportController');
const SystemConfigController = require('../controllers/adminController/systemConfig');
const AiManagementController = require('../controllers/adminController/aiManagement');
const { authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validate, userSchemas, examSchemas } = require('../middleware/validation');
const { apiLimiter, uploadLimiter } = require('../middleware/rateLimiter');

// Tất cả admin routes yêu cầu xác thực và quyền admin
router.use(authMiddleware);
router.use(isAdmin);

// =====================================
// ADMIN USER MANAGEMENT
// =====================================
// GET /admin/users - Danh sách tất cả người dùng
router.get('/users', apiLimiter, UserManagementController.getAllUsers);

// POST /admin/users - Tạo tài khoản người dùng
router.post('/users', validate(userSchemas.createUser), UserManagementController.createUser);

// GET /admin/users/:userId - Chi tiết người dùng
router.get('/users/:userId', UserManagementController.getUserById);

// PUT /admin/users/:userId - Cập nhật người dùng
router.put('/users/:userId', validate(userSchemas.updateUser), UserManagementController.updateUser);

// DELETE /admin/users/:userId - Xóa người dùng
router.delete('/users/:userId', UserManagementController.deleteUser);

// POST /admin/users/:userId/reset-password - Đặt lại mật khẩu cho người dùng
router.post('/users/:userId/reset-password', UserManagementController.resetUserPassword);

// GET /admin/users/role/:role - Lấy users theo role
router.get('/users/role/:role', UserManagementController.getUsersByRole);

// GET /admin/users/stats - Thống kê người dùng
router.get('/users/stats', UserManagementController.getUserStats);

// GET /admin/users/recent - Người dùng mới
router.get('/users/recent', UserManagementController.getRecentUsers);

// GET /admin/users/search - Tìm kiếm người dùng
router.get('/users/search', UserManagementController.searchUsers);

// GET /admin/users/export - Xuất dữ liệu người dùng
router.get('/users/export', UserManagementController.exportUsers);

// =====================================
// ADMIN EXAM MANAGEMENT
// =====================================
// GET /admin/exams - Danh sách tất cả bài thi
router.get('/exams', apiLimiter, AdminExamController.getAllExams);

// GET /admin/exams/:examId - Chi tiết bài thi
router.get('/exams/:examId', AdminExamController.getExamById);

// PUT /admin/exams/:examId - Cập nhật bài thi
router.put('/exams/:examId', validate(examSchemas.updateExam), AdminExamController.updateExam);

// DELETE /admin/exams/:examId - Xóa bài thi
router.delete('/exams/:examId', AdminExamController.deleteExam);

// POST /admin/exams/:examId/approve - Phê duyệt bài thi
router.post('/exams/:examId/approve', AdminExamController.approveExam);

// POST /admin/exams/:examId/reject - Từ chối bài thi
router.post('/exams/:examId/reject', AdminExamController.rejectExam);

// GET /admin/exams/stats - Thống kê bài thi
router.get('/exams/stats', AdminExamController.getExamStats);

// GET /admin/exams/pending - Bài thi chờ duyệt
router.get('/exams/pending', AdminExamController.getPendingExams);

// =====================================
// ADMIN REPORTS & ANALYTICS
// =====================================
// GET /admin/reports/overview - Tổng quan dashboard
router.get('/reports/overview', ReportController.getDashboardOverview);

// GET /admin/reports/users - Analytics người dùng
router.get('/reports/users', ReportController.getUserAnalytics);

// GET /admin/reports/exams - Analytics bài thi
router.get('/reports/exams', ReportController.getExamAnalytics);

// GET /admin/reports/system - Analytics hệ thống
router.get('/reports/system', ReportController.getSystemAnalytics);

// GET /admin/reports/activities - Nhật ký hoạt động
router.get('/reports/activities', ReportController.getActivityLogs);

// GET /admin/reports/realtime - Thống kê real-time
router.get('/reports/realtime', ReportController.getRealTimeStats);

// POST /admin/reports/generate - Tạo báo cáo
router.post('/reports/generate', ReportController.generateReport);

// GET /admin/health - Kiểm tra sức khỏe hệ thống
router.get('/health', ReportController.getHealthCheck);

// =====================================
// ADMIN SYSTEM CONFIGURATION
// =====================================
// GET /admin/system/info - Thông tin hệ thống
router.get('/system/info', SystemConfigController.getSystemInfo);

// GET /admin/system/config - Cấu hình hệ thống
router.get('/system/config', SystemConfigController.getSystemConfig);

// PUT /admin/system/config - Cập nhật cấu hình
router.put('/system/config', SystemConfigController.updateSystemConfig);

// GET /admin/system/logs - Nhật ký hệ thống
router.get('/system/logs', SystemConfigController.getSystemLogs);

// POST /admin/system/backup - Sao lưu hệ thống
router.post('/system/backup', SystemConfigController.backupSystem);

// GET /admin/system/backup/status - Trạng thái sao lưu
router.get('/system/backup/status', SystemConfigController.getBackupStatus);

// POST /admin/system/maintenance - Chế độ bảo trì
router.post('/system/maintenance', SystemConfigController.setMaintenanceMode);

// POST /admin/system/database - Thao tác cơ sở dữ liệu
router.post('/system/database', SystemConfigController.databaseOperations);

// POST /admin/system/cache - Quản lý cache
router.post('/system/cache', SystemConfigController.manageCaches);

// GET /admin/system/security/audit - Nhật ký bảo mật
router.get('/system/security/audit', SystemConfigController.getSecurityAudit);

// POST /admin/system/cleanup - Dọn dẹp hệ thống
router.post('/system/cleanup', SystemConfigController.cleanupSystem);

// POST /admin/system/restart - Khởi động lại dịch vụ
router.post('/system/restart', SystemConfigController.restartServices);

module.exports = router;
