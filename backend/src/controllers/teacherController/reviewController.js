const {
  AttemptAnswer,
  AnswerAiFeedback,
  ExamAttempt,
  Exam,
  ExamSection,
  Question,
  QuestionType,
  SkillType,
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

/**
 * Get submissions list for writing and speaking
 */
exports.getSubmissions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, answer_type, needs_review } = req.query;
    const { offset, limit: validLimit } = paginate(page, limit);

    const where = {};
    
    // Filter by answer type (text for writing, audio for speaking)
    if (answer_type) {
      where.answer_type = answer_type;
    } else {
      // Default to only writing and speaking
      where.answer_type = ['text', 'audio'];
    }
    
    // Filter by review status
    if (needs_review !== undefined) {
      where.needs_review = needs_review === 'true';
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
              attributes: ['id', 'full_name', 'email', 'avatar_url'],
            },
            {
              model: Exam,
              as: 'exam',
              attributes: ['id', 'title'],
              include: [
                {
                  model: ExamSection,
                  as: 'sections',
                  attributes: ['id', 'skill_type_id'],
                  include: [
                    {
                      model: SkillType,
                      as: 'skillType',
                      attributes: ['id', 'name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'content', 'difficulty'],
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
 * Get submission detail for review
 */
exports.getSubmissionDetail = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findByPk(attemptId, {
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'full_name', 'email', 'avatar_url'],
        },
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    // Get all answers for this attempt
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'content', 'difficulty', 'question_type_id'],
          include: [
            {
              model: QuestionType,
              as: 'questionType',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: AnswerAiFeedback,
          as: 'aiFeedbacks',
        },
      ],
      order: [['id', 'ASC']],
    });

    // Determine skill type from answers
    let skill = 'writing';
    if (answers.length > 0) {
      skill = answers[0].answer_type === 'audio' ? 'speaking' : 'writing';
    }

    res.json({
      success: true,
      data: {
        id: attempt.id,
        student: attempt.student,
        exam: attempt.exam,
        skill,
        status: attempt.status,
        submitted_at: attempt.submitted_at,
        total_score: attempt.total_score,
        answers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit answer review (individual answer)
 */
exports.submitAnswerReview = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { scores, feedback, final_score } = req.body;
    const teacherId = req.user.userId;

    const answer = await AttemptAnswer.findByPk(answerId);

    if (!answer) {
      throw new NotFoundError('Answer not found');
    }

    await answer.update({
      final_score: final_score !== undefined ? final_score : answer.score,
      manual_feedback: feedback,
      reviewed_by: teacherId,
      reviewed_at: new Date(),
      needs_review: false,
      // Store detailed scores as JSON
      criteria_scores: scores ? JSON.stringify(scores) : answer.criteria_scores,
    });

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit attempt review (complete attempt)
 */
exports.submitAttemptReview = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { reviewData } = req.body;
    const teacherId = req.user.userId;

    const attempt = await ExamAttempt.findByPk(attemptId);

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    // Update all answers in this attempt
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
    });

    for (const answer of answers) {
      await answer.update({
        final_score: reviewData.final_score,
        manual_feedback: reviewData.feedback,
        reviewed_by: teacherId,
        reviewed_at: new Date(),
        needs_review: false,
        criteria_scores: reviewData.scores ? JSON.stringify(reviewData.scores) : answer.criteria_scores,
      });
    }

    // Update attempt total score
    const totalScore = answers.reduce((sum, a) => {
      return sum + (parseFloat(reviewData.final_score) || 0);
    }, 0);

    await attempt.update({ 
      total_score: Math.round(totalScore * 100) / 100,
      status: 'completed',
    });

    res.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update answer score
 */
exports.updateAnswerScore = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { score } = req.body;
    const teacherId = req.user.userId;

    const answer = await AttemptAnswer.findByPk(answerId);

    if (!answer) {
      throw new NotFoundError('Answer not found');
    }

    await answer.update({
      final_score: score,
      reviewed_by: teacherId,
      reviewed_at: new Date(),
    });

    res.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    next(error);
  }
};
