const { AttemptAnswer, AiScoringCriteria, Question } = require('../models');
const AiScoringService = require('../services/AiScoringService');

/**
 * Health check with AI services status
 */
exports.getAiStatus = async (req, res, next) => {
  try {
    const status = {
      success: true,
      timestamp: new Date().toISOString(),
      services: {
        database: 'checking',
        gemini_api: 'checking',
        ai_criteria: 'checking',
      },
      details: {},
    };

    // Check database
    try {
      const criteria = await AiScoringCriteria.count();
      status.services.database = 'online';
      status.details.ai_criteria_count = criteria;
    } catch (e) {
      status.services.database = 'offline';
      status.details.database_error = e.message;
    }

    // Check Gemini API
    try {
      const testResult = await AiScoringService.scoreWriting(
        548, // Test with real answer if exists
        'This is a test sentence to check if AI API is working properly.'
      );
      status.services.gemini_api = testResult ? 'online' : 'error';
      status.details.test_result = testResult;
    } catch (e) {
      status.services.gemini_api = 'offline';
      status.details.api_error = e.message;
      if (e.message.includes('API key')) {
        status.details.recommendation = 'Update GEMINI_API_KEY in .env file';
      }
    }

    // Count pending scoring jobs
    try {
      const pendingCount = await AttemptAnswer.count({
        where: { score: null, ai_graded_at: null },
      });
      status.details.pending_ai_scoring = pendingCount;
    } catch (e) {
      status.details.pending_error = e.message;
    }

    res.json(status);
  } catch (error) {
    next(error);
  }
};

/**
 * Test AI scoring with a sample answer
 */
exports.testAiScoring = async (req, res, next) => {
  try {
    const { text_answer = 'Social media has become an integral part of modern society.' } = req.body;

    if (!text_answer) {
      return res.status(400).json({
        success: false,
        message: 'text_answer is required',
      });
    }

    const result = {
      input: text_answer,
      timestamp: new Date().toISOString(),
      status: 'testing',
    };

    try {
      // Try to score with Writing service
      const feedback = await AiScoringService.scoreWriting(
        999, // Dummy answer ID
        text_answer
      );

      result.status = 'success';
      result.response = feedback;
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;

      if (error.message.includes('API key')) {
        result.troubleshooting = [
          'GEMINI_API_KEY in .env is invalid or expired',
          'Get a new API key from https://aistudio.google.com/app/apikey',
          'Update .env file: GEMINI_API_KEY=your_new_key',
          'Restart the server',
        ];
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI scoring queue status
 */
exports.getQueueStatus = async (req, res, next) => {
  try {
    const status = {
      success: true,
      timestamp: new Date().toISOString(),
      queue: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
      },
      details: {},
    };

    try {
      // Count pending (no score yet)
      status.queue.pending = await AttemptAnswer.count({
        where: {
          score: null,
          ai_graded_at: null,
        },
      });

      // Count completed (has score)
      status.queue.completed = await AttemptAnswer.count({
        where: {
          score: { [require('sequelize').Op.not]: null },
          ai_graded_at: { [require('sequelize').Op.not]: null },
        },
      });

      // Count needs_review (failed attempts)
      status.queue.failed = await AttemptAnswer.count({
        where: { needs_review: true },
      });

      // Get sample pending answers
      const samples = await AttemptAnswer.findAll({
        where: { score: null, ai_graded_at: null },
        attributes: ['id', 'attempt_id', 'question_id', 'answered_at'],
        limit: 3,
        order: [['id', 'ASC']],
      });

      status.details.sample_pending = samples.map(s => ({
        id: s.id,
        attempt_id: s.attempt_id,
        question_id: s.question_id,
        answered_at: s.answered_at,
      }));
    } catch (e) {
      status.details.error = e.message;
    }

    res.json(status);
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI criteria available
 */
exports.getAiCriteria = async (req, res, next) => {
  try {
    const { aptis_type_id = 1, question_type_id } = req.query;

    const where = { aptis_type_id };
    if (question_type_id) {
      where.question_type_id = question_type_id;
    }

    const criteria = await AiScoringCriteria.findAll({
      where,
      attributes: [
        'id',
        'question_type_id',
        'criteria_name',
        'weight',
        'max_score',
        'rubric_prompt',
      ],
      order: [['question_type_id', 'ASC'], ['criteria_name', 'ASC']],
    });

    // Group by question type
    const grouped = {};
    criteria.forEach(c => {
      if (!grouped[c.question_type_id]) {
        grouped[c.question_type_id] = [];
      }
      grouped[c.question_type_id].push({
        criteria_name: c.criteria_name,
        weight: parseFloat(c.weight),
        max_score: parseFloat(c.max_score),
      });
    });

    res.json({
      success: true,
      count: criteria.length,
      criteria: grouped,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * Requeue pending answers for AI scoring (now with synchronous scoring)
 */
exports.requeuPendingAnswers = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query; // Score max 100 at a time
    const AiScoringService = require('../services/AiScoringService');
    const { Question, QuestionType } = require('../models');

    // Find pending answers
    const pendingAnswers = await AttemptAnswer.findAll({
      where: {
        score: null,
        ai_graded_at: null,
      },
      attributes: ['id', 'attempt_id', 'question_id', 'text_answer', 'audio_url'],
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'question_type_id'],
          include: [
            {
              model: QuestionType,
              as: 'questionType',
              attributes: ['id', 'question_type_name'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      order: [['id', 'ASC']],
    });

    const scored = [];
    const failed = [];
    const skipped = [];

    for (const answer of pendingAnswers) {
      try {
        const questionType = answer.question?.questionType?.question_type_name || 'UNKNOWN';
        const isWriting = questionType.includes('WRITING');

        if (isWriting && answer.text_answer && answer.text_answer.trim()) {
          // Score Writing answer synchronously
          try {
            const result = await AiScoringService.scoreWriting(answer.id);
            scored.push({
              answer_id: answer.id,
              question_type: questionType,
              score: result.totalScore,
              max_score: result.totalMaxScore,
            });
          } catch (scoreError) {
            failed.push({
              answer_id: answer.id,
              question_type: questionType,
              error: scoreError.message,
            });
          }
        } else if (!isWriting) {
          // Skip Speaking (requires transcription first)
          skipped.push({
            answer_id: answer.id,
            question_type: questionType,
            reason: 'Speaking answers require transcription first',
          });
        } else {
          // Skip - no text answer
          skipped.push({
            answer_id: answer.id,
            question_type: questionType,
            reason: 'No text answer provided',
          });
        }
      } catch (e) {
        failed.push({
          answer_id: answer.id,
          error: e.message,
        });
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        total_found: pendingAnswers.length,
        scored: scored.length,
        failed: failed.length,
        skipped: skipped.length,
      },
      scored_answers: scored,
      failed_answers: failed,
      skipped_answers: skipped,
      message: `${scored.length} answers scored synchronously. ${skipped.length} skipped (transcription pending).`,
    });
  } catch (error) {
    next(error);
  }
};