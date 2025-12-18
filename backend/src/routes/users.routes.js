const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validate, userSchemas } = require('../middleware/validation');
const { apiLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/storage');

// User profile routes (authenticated users)
router.get('/profile', authMiddleware, userController.getProfile);

router.put(
  '/profile',
  authMiddleware,
  validate(userSchemas.updateProfile),
  userController.updateProfile,
);

router.post(
  '/change-password',
  authMiddleware,
  validate(userSchemas.changePassword),
  userController.changePassword,
);

router.post(
  '/profile/avatar',
  authMiddleware,
  uploadLimiter,
  upload.single('avatar'),
  userController.uploadAvatar,
);

// Admin user management routes
router.get('/admin/users', authMiddleware, isAdmin, apiLimiter, userController.getAllUsers);

router.post(
  '/admin/users',
  authMiddleware,
  isAdmin,
  validate(userSchemas.createUser),
  userController.createUser,
);

router.put(
  '/admin/users/:userId',
  authMiddleware,
  isAdmin,
  validate(userSchemas.updateUser),
  userController.updateUser,
);

router.delete('/admin/users/:userId', authMiddleware, isAdmin, userController.deleteUser);

router.post(
  '/admin/users/:userId/reset-password',
  authMiddleware,
  isAdmin,
  userController.resetUserPassword,
);

module.exports = router;
