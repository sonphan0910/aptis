const {
  AttemptAnswer,
  AnswerAiFeedback,
  ExamAttempt,
  Question,
  QuestionType,
  User,
} = require('../../models');
const { paginate, paginationResponse } = require('../../utils/helpers');
const { NotFoundError } = require('../../utils/errors');

/**
 * Get pending answers for review
 */
exports.getPendingReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, exam_id, student_id } = req.query;
    const { offset, limit: validLimit } = paginate(page, limit);

    const where = { needs_review: true };

    if (exam_id) {
      // Filter by exam
      const attempts = await ExamAttempt.findAll({
        where: { exam_id },
        attributes: ['id'],
      });
      where.attempt_id = attempts.map((a) => a.id);
    }

    if (student_id) {
      const attempts = await ExamAttempt.findAll({
        where: { student_id },
        attributes: ['id'],
      });
      where.attempt_id = attempts.map((a) => a.id);
    }

    const { count, rows } = await AttemptAnswer.findAndCountAll({
      where,
      include: [
        {
          model: ExamAttempt,
          as: 'attempt',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'full_name', 'email'],
            },
          ],
        },
        {
          model: Question,
          as: 'question',
          include: [
            {
              model: QuestionType,
              as: 'questionType',
            },
          ],
        },
        {
          model: AnswerAiFeedback,
          as: 'aiFeedbacks',
        },
      ],
      offset,
      limit: validLimit,
      order: [['answered_at', 'DESC']],
    });

    res.json({
      success: true,
      ...paginationResponse(rows, parseInt(page), validLimit, count),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get answer details for review
 */
exports.getAnswerForReview = async (req, res, next) => {
  try {
    const { answerId } = req.params;

    const answer = await AttemptAnswer.findByPk(answerId, {
      include: [
        {
          model: ExamAttempt,
          as: 'attempt',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'full_name', 'email'],
            },
          ],
        },
        {
          model: Question,
          as: 'question',
          include: [
            {
              model: QuestionType,
              as: 'questionType',
            },
          ],
        },
        {
          model: AnswerAiFeedback,
          as: 'aiFeedbacks',
        },
      ],
    });

    if (!answer) {
      throw new NotFoundError('Answer not found');
    }

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit manual review
 */
exports.submitReview = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { final_score, manual_feedback, override_ai } = req.body;
    const teacherId = req.user.userId;

    const answer = await AttemptAnswer.findByPk(answerId);

    if (!answer) {
      throw new NotFoundError('Answer not found');
    }

    await answer.update({
      final_score: override_ai ? final_score : answer.score || final_score,
      manual_feedback,
      reviewed_by: teacherId,
      reviewed_at: new Date(),
      needs_review: false,
    });

    // Update attempt total score
    const attempt = await ExamAttempt.findByPk(answer.attempt_id);
    const allAnswers = await AttemptAnswer.findAll({
      where: { attempt_id: answer.attempt_id },
    });

    const totalScore = allAnswers.reduce((sum, a) => {
      const score = a.final_score !== null ? a.final_score : a.score || 0;
      return sum + parseFloat(score);
    }, 0);

    await attempt.update({ total_score: Math.round(totalScore * 100) / 100 });

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews by exam
 */
exports.getReviewsByExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const { offset, limit: validLimit } = paginate(page, limit);

    const attempts = await ExamAttempt.findAll({
      where: { exam_id: examId },
      attributes: ['id'],
    });

    const attemptIds = attempts.map((a) => a.id);

    const { count, rows } = await AttemptAnswer.findAndCountAll({
      where: {
        attempt_id: attemptIds,
        needs_review: true,
      },
      include: [
        {
          model: ExamAttempt,
          as: 'attempt',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'full_name', 'email'],
            },
          ],
        },
        {
          model: Question,
          as: 'question',
        },
      ],
      offset,
      limit: validLimit,
      order: [['answered_at', 'DESC']],
    });

    res.json({
      success: true,
      ...paginationResponse(rows, parseInt(page), validLimit, count),
    });
  } catch (error) {
    next(error);
  }
};
