
// ============================================================
// Middleware kiểm tra vai trò (role) người dùng
// ============================================================
const { ForbiddenError } = require('../utils/errors');

/**
 * Middleware kiểm tra vai trò người dùng
 * @param  {...string} allowedRoles - Danh sách các vai trò được phép truy cập
 * Cách sử dụng:
 *   - roleCheck('admin') - chỉ admin
 *   - roleCheck('teacher', 'admin') - teacher hoặc admin
 *   - roleCheck('student') - chỉ student
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    // Kiểm tra user đã đăng nhập chưa (authMiddleware phải được gọi trước)
    if (!req.user) {
      return next(new ForbiddenError('Bạn cần đăng nhập'));
    }

    // Kiểm tra vai trò có nằm trong danh sách được phép không
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Bạn không có quyền truy cập chức năng này'));
    }

    next();
  };
};

/**
 * Middleware chỉ cho phép admin truy cập
 * Cách sử dụng: app.get('/admin-panel', isAdmin, controller)
 */
const isAdmin = roleCheck('admin');

/**
 * Middleware cho phép giáo viên hoặc admin truy cập
 * Cách sử dụng: app.post('/create-exam', isTeacherOrAdmin, controller)
 */
const isTeacherOrAdmin = roleCheck('teacher', 'admin');

/**
 * Middleware chỉ cho phép học sinh truy cập
 * Cách sử dụng: app.post('/start-exam', isStudent, controller)
 */
const isStudent = roleCheck('student');

/**
 * Middleware kiểm tra quyền quản lý resource (chủ sở hữu hoặc admin)
 * Admin có quyền quản lý mọi resource
 * User thường chỉ được quản lý resource của chính mình
 * @param getOwnerId: hàm async nhận req, trả về userId chủ sở hữu resource
 * Cách sử dụng:
 *   canManageResource(async (req) => {
 *     const question = await Question.findByPk(req.params.questionId);
 *     return question.created_by;
 *   })
 */
const canManageResource = (getOwnerId) => {
  return async (req, res, next) => {
    // Kiểm tra user đã đăng nhập
    if (!req.user) {
      return next(new ForbiddenError('Bạn cần đăng nhập'));
    }

    // Admin có quyền quản lý mọi resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Lấy userId chủ sở hữu resource
    const ownerId = await getOwnerId(req);

    // Kiểm tra user có phải chủ sở hữu không
    if (req.user.userId !== ownerId) {
      return next(new ForbiddenError('Bạn chỉ được phép thao tác với tài nguyên của mình'));
    }

    next();
  };
};

module.exports = {
  roleCheck,
  isAdmin,
  isTeacherOrAdmin,
  isStudent,
  canManageResource,
};
