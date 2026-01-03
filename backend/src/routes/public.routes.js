const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const aiTestController = require('../controllers/aiTestController');
const { apiLimiter } = require('../middleware/rateLimiter');

// GET /public/aptis-types - Get all APTIS types (constants only)
router.get('/aptis-types', apiLimiter, publicController.getAptisTypes);

// GET /public/skill-types - Get all skill types (constants only)
router.get('/skill-types', apiLimiter, publicController.getSkillTypes);

// GET /public/question-types - Get all question types (constants only)
router.get('/question-types', apiLimiter, publicController.getQuestionTypes);

// ========================================
// AI TESTING ENDPOINTS (Development/Admin)
// ========================================

/**
 * @swagger
 * /public/ai/status:
 *   get:
 *     summary: Check AI services status (Database, Gemini API, Criteria)
 *     tags: [AI Testing]
 *     description: Check health of all AI-related services
 *     responses:
 *       200:
 *         description: Status of all AI services
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               timestamp: "2025-12-18T13:40:00Z"
 *               services:
 *                 database: "online"
 *                 gemini_api: "online"
 *                 ai_criteria: "online"
 *               details:
 *                 ai_criteria_count: 32
 */
router.get('/ai/status', aiTestController.getAiStatus);

/**
 * @swagger
 * /public/ai/test:
 *   post:
 *     summary: Test AI scoring with sample text
 *     tags: [AI Testing]
 *     description: Send sample text to test if AI scoring API is working
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text_answer:
 *                 type: string
 *                 example: "Social media has become an integral part of modern society."
 *     responses:
 *       200:
 *         description: AI test result
 *         content:
 *           application/json:
 *             example:
 *               input: "Sample text..."
 *               timestamp: "2025-12-18T13:40:00Z"
 *               status: "success"
 *               response: { score: 18.5, feedback: "..." }
 */
router.post('/ai/test', aiTestController.testAiScoring);

/**
 * @swagger
 * /public/ai/queue:
 *   get:
 *     summary: Get AI scoring queue status
 *     tags: [AI Testing]
 *     description: Check pending, completed, and failed scoring jobs
 *     responses:
 *       200:
 *         description: Queue status
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               queue:
 *                 pending: 5
 *                 completed: 120
 *                 failed: 2
 */
router.get('/ai/queue', aiTestController.getQueueStatus);

/**
 * @swagger
 * /public/ai/criteria:
 *   get:
 *     summary: Get available AI scoring criteria
 *     tags: [AI Testing]
 *     parameters:
 *       - in: query
 *         name: aptis_type_id
 *         schema:
 *           type: integer
 *         default: 1
 *         description: APTIS type ID
 *       - in: query
 *         name: question_type_id
 *         schema:
 *           type: integer
 *         description: Question type ID (optional)
 *     description: Get all AI criteria available for scoring
 *     responses:
 *       200:
 *         description: AI criteria grouped by question type
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               count: 4
 *               criteria:
 *                 "12":
 *                   - criteria_name: "Content Relevance"
 *                     weight: 0.3
 *                     max_score: 10
 */
router.get('/ai/criteria', aiTestController.getAiCriteria);

/**
 * @swagger
 * /api/public/ai/requeue:
 *   post:
 *     summary: Requeue pending answers for AI scoring with rate limiting
 *     description: |
 *       Finds all pending answers and requeues them for AI scoring.
 *       Rate limiting ensures 1 request per second to respect free tier quotas.
 *       With 530 pending answers, this will take ~9 minutes to process all.
 *     tags: [AI Testing]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of answers to requeue at once
 *     responses:
 *       200:
 *         description: Answers requeued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 timestamp:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_found:
 *                       type: number
 *                     requeued:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     estimated_time_seconds:
 *                       type: number
 *                 requeued_answers:
 *                   type: array
 *                 message:
 *                   type: string
 *               example:
 *                 success: true
 *                 summary:
 *                   total_found: 530
 *                   requeued: 530
 *                   failed: 0
 *                   estimated_time_seconds: 33000
 *                 message: "530 answers requeued. With rate limiting (1/sec), scoring will take ~9 minutes."
 */
router.post('/ai/requeue', aiTestController.requeuPendingAnswers);

// GET /public/questions/writing - Get all Writing questions for testing dynamic content
router.get('/questions/writing', apiLimiter, publicController.getWritingQuestions);

module.exports = router;
