/**
 * =================================================================
 * STUDENT ROUTES - ĐỊNH TUYẾN HỌC SINH
 * =================================================================
 * 
 * File này quản lý các route dành cho học sinh:
 * - Dashboard và thống kê cá nhân
 * - Xem danh sách và chi tiết bài thi
 * - Bắt đầu và quản lý lượt thi
 * - Trả lời câu hỏi (text và audio)
 * - Xem kết quả và feedback
 * - Practice mode
 * 
 * Tất cả routes yêu cầu:
 * - authMiddleware: Đã đăng nhập
 * - isStudent: Có role student
 * =================================================================
 */

const express = require('express');
const router = express.Router();
const examController = require('../controllers/studentController/examController');
const attemptController = require('../controllers/studentController/attemptController');
const answerController = require('../controllers/studentController/answerController');
const resultController = require('../controllers/studentController/resultController');
const dashboardController = require('../controllers/studentController/dashboardController');
const practiceController = require('../controllers/studentController/practiceController');
const { authMiddleware } = require('../middleware/auth');
const { isStudent } = require('../middleware/roleCheck');
const { validate, examSchemas, attemptSchemas } = require('../middleware/validation');
const { apiLimiter, uploadLimiter, submissionLimiter } = require('../middleware/rateLimiter');
const {upload} = require('../config/storage');

// =====================================
// DASHBOARD - BẢNG ĐIỀU KHIỂN
// =====================================

// GET /student/dashboard/stats - Thống kê cá nhân của học sinh
router.get('/dashboard/stats', authMiddleware, isStudent, apiLimiter, dashboardController.getStats);
// GET /student/dashboard/recent-attempts - Lượt thi gần đây
router.get('/dashboard/recent-attempts', authMiddleware, isStudent, apiLimiter, dashboardController.getRecentAttempts);

// =====================================
// EXAM ROUTES - QUẢN LÝ BÀI THI
// =====================================

// GET /student/exams - Danh sách bài thi có thể làm
router.get('/exams', authMiddleware, isStudent, apiLimiter, examController.getExams);

// GET /student/exams/:examId - Chi tiết bài thi
router.get('/exams/:examId', authMiddleware, isStudent, examController.getExamDetails);

// GET /student/exams/:examId/skills - Danh sách kỹ năng trong bài thi
router.get('/exams/:examId/skills', authMiddleware, isStudent, examController.getExamSkills);

// GET /student/attempts - Lịch sử lượt thi của học sinh
router.get('/attempts', authMiddleware, isStudent, apiLimiter, examController.getMyAttempts);

// =====================================
// ATTEMPT ROUTES - QUẢN LÝ LƯỢT THI
// =====================================

// POST /student/attempts - Bắt đầu lượt thi mới
router.post(
  '/attempts',
  authMiddleware,
  isStudent,
  validate(attemptSchemas.startAttempt),
  attemptController.startAttempt,
);

// GET /student/attempts/:attemptId - Chi tiết lượt thi
router.get('/attempts/:attemptId', authMiddleware, isStudent, attemptController.getAttempt);

// GET /student/attempts/:attemptId/questions - Danh sách câu hỏi trong lượt thi
router.get('/attempts/:attemptId/questions', authMiddleware, isStudent, attemptController.getAttemptQuestions);

// POST /student/attempts/:attemptId/submit - Nộp bài thi
// Middleware: submissionLimiter (tránh spam submit)
router.post(
  '/attempts/:attemptId/submit',
  authMiddleware,
  isStudent,
  submissionLimiter,
  attemptController.submitAttempt,
);

// =====================================
// ANSWER ROUTES - TRẢ LỜI CÂU HỎI
// =====================================

// POST /student/attempts/:attemptId/answers - Lưu câu trả lời dạng text
router.post(
  '/attempts/:attemptId/answers',
  authMiddleware,
  isStudent,
  validate(attemptSchemas.saveAnswer),
  answerController.saveAnswer,
);

// POST /student/attempts/:attemptId/answers/audio - Upload câu trả lời dạng audio
// Middleware: uploadLimiter (giới hạn upload), upload.single (xử lý file audio)
router.post(
  '/attempts/:attemptId/answers/audio',
  authMiddleware,
  isStudent,
  uploadLimiter,
  upload.single('audio'),
  answerController.uploadAudioAnswer,
);

// GET /student/attempts/:attemptId/status - Kiểm tra trạng thái scoring
router.get('/attempts/:attemptId/status', authMiddleware, isStudent, attemptController.getAttemptStatus);

// =====================================
// RESULT ROUTES - KỘI QUẢ THI
// =====================================

// GET /student/attempts/:attemptId/results - Xem kết quả thi
router.get('/attempts/:attemptId/results', authMiddleware, isStudent, resultController.getResults);

// GET /student/attempts/:attemptId/answers/:answerId/feedback - Xem feedback chi tiết của câu trả lời
router.get(
  '/attempts/:attemptId/answers/:answerId/feedback',
  authMiddleware,
  isStudent,
  resultController.getAnswerFeedback,
);

// =====================================
// PRACTICE ROUTES - LUYỆN TẬP
// =====================================

// GET /student/practice/questions - Lấy câu hỏi để luyện tập
router.get('/practice/questions', authMiddleware, isStudent, apiLimiter, practiceController.getPracticeQuestions);

// POST /student/practice/submit - Nộp bài luyện tập
router.post(
  '/practice/submit',
  authMiddleware,
  isStudent,
  practiceController.submitPracticeAnswer,
);

// GET /student/practice/stats - Thống kê luyện tập
router.get('/practice/stats', authMiddleware, isStudent, apiLimiter, practiceController.getPracticeStats);

module.exports = router;
