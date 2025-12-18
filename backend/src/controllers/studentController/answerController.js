const {
  AttemptAnswer,
  ExamAttempt,
  Question,
  QuestionType,
  AnswerAiFeedback,
  AiScoringCriteria,
} = require('../../models');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const { isValidAnswer } = require('../../utils/validators');
const { successResponse, errorResponse } = require('../../utils/response');
const ScoringService = require('../../services/ScoringService');
const StorageService = require('../../services/StorageService');
const SpeechToTextService = require('../../services/SpeechToTextService');

/**
 * Save answer
 */
exports.saveAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { question_id, answer_type, selected_option_id, answer_json, text_answer, audio_url } =
      req.body;
    const studentId = req.user.userId;

    // Verify attempt belongs to student
    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
    });

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestError('Cannot save answer - attempt not in progress');
    }

    // Find answer record
    const answer = await AttemptAnswer.findOne({
      where: { attempt_id: attemptId, question_id },
      include: [
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
      ],
    });

    if (!answer) {
      throw new NotFoundError('Answer not found');
    }

    // Validate answer
    if (!isValidAnswer({ answer_type, selected_option_id, answer_json, text_answer, audio_url })) {
      throw new BadRequestError('Invalid answer data');
    }

    // Update answer
    await answer.update({
      answer_type,
      selected_option_id: selected_option_id || null,
      answer_json: answer_json || null,
      text_answer: text_answer || null,
      audio_url: audio_url || null,
      answered_at: new Date(),
    });

    // Auto-grade if possible
    const score = await ScoringService.autoGradeAnswer(answer.id);

    // Reload answer with full data to return to frontend
    const updatedAnswer = await AttemptAnswer.findByPk(answer.id, {
      include: [
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
      ],
    });

    // Format answer data for frontend
    const answerData = {
      id: updatedAnswer.id,
      attempt_id: updatedAnswer.attempt_id,
      question_id: updatedAnswer.question_id,
      answer_type: updatedAnswer.answer_type,
      selected_option_id: updatedAnswer.selected_option_id,
      answer_json: updatedAnswer.answer_json,
      text_answer: updatedAnswer.text_answer,
      audio_url: updatedAnswer.audio_url,
      answered_at: updatedAnswer.answered_at,
      score: updatedAnswer.score,
      max_score: updatedAnswer.max_score,
      // Create answer_data structure that components expect
      answer_data: null,
    };

    // Parse answer_data based on answer_type for component consumption
    if (updatedAnswer.answer_type === 'option' && updatedAnswer.selected_option_id) {
      answerData.answer_data = { selected_option: updatedAnswer.selected_option_id };
    } else if (updatedAnswer.answer_type === 'json' && updatedAnswer.answer_json) {
      try {
        const parsed = JSON.parse(updatedAnswer.answer_json);
        answerData.answer_data = parsed;
      } catch (e) {
        answerData.answer_data = updatedAnswer.answer_json;
      }
    } else if (updatedAnswer.answer_type === 'text' && updatedAnswer.text_answer) {
      answerData.answer_data = { text: updatedAnswer.text_answer };
    } else if (updatedAnswer.answer_type === 'audio' && updatedAnswer.audio_url) {
      answerData.answer_data = { audio_url: updatedAnswer.audio_url };
    }

    return successResponse(
      res, 
      score !== null ? 'Answer saved and graded' : 'Answer saved', 
      answerData
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Upload audio answer
 */
exports.uploadAudioAnswer = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { question_id } = req.body;
    const studentId = req.user.userId;

    if (!req.file) {
      throw new BadRequestError('No audio file uploaded');
    }

    // Verify attempt
    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
    });

    if (!attempt || attempt.status !== 'in_progress') {
      throw new BadRequestError('Invalid attempt');
    }

    // Validate audio file
    SpeechToTextService.validateAudioFile(req.file);

    // Upload audio
    const audioInfo = await SpeechToTextService.uploadAudioFile(req.file);

    // Find and update answer
    const answer = await AttemptAnswer.findOne({
      where: { attempt_id: attemptId, question_id },
    });

    if (!answer) {
      throw new NotFoundError('Answer not found');
    }

    await answer.update({
      answer_type: 'audio',
      audio_url: audioInfo.url,
      answered_at: new Date(),
    });

    return successResponse(res, 'Audio answer uploaded successfully', {
      answerId: answer.id,
      audio_url: audioInfo.url,
      duration: audioInfo.duration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed feedback for an answer
 */
exports.getAnswerFeedback = async (req, res, next) => {
  try {
    const { attemptId, answerId } = req.params;
    const studentId = req.user.userId;

    // Verify attempt belongs to student
    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
    });

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    // Find answer with detailed information
    const answer = await AttemptAnswer.findOne({
      where: {
        id: answerId,
        attempt_id: attemptId,
      },
      include: [
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
      ],
    });

    if (!answer) {
      throw new NotFoundError('Answer not found');
    }

    // Get AI feedback details if available
    let aiFeedbackDetails = null;

    if (answer.graded_by === 'ai' || answer.ai_graded_at) {
      const aiFeedbacks = await AnswerAiFeedback.findAll({
        where: { answer_id: answerId },
        include: [
          {
            model: AiScoringCriteria,
            as: 'criteria',
          },
        ],
        order: [['criteria', 'criteria_name', 'ASC']],
      });

      if (aiFeedbacks && aiFeedbacks.length > 0) {
        aiFeedbackDetails = aiFeedbacks.map((feedback) => ({
          criteria: {
            name: feedback.criteria.criteria_name,
            description: feedback.criteria.description,
            weight: feedback.criteria.weight,
          },
          score: feedback.score,
          maxScore: feedback.max_score,
          percentage: Math.round((feedback.score / feedback.max_score) * 100),
          comment: feedback.comment,
          suggestions: feedback.suggestions,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
        }));
      }
    }

    // Parse AI feedback JSON if available
    let aiFeedback = null;
    if (answer.ai_feedback) {
      try {
        aiFeedback =
          typeof answer.ai_feedback === 'string'
            ? JSON.parse(answer.ai_feedback)
            : answer.ai_feedback;
      } catch (e) {
        // If parsing fails, keep as is
        aiFeedback = answer.ai_feedback;
      }
    }

    const feedbackData = {
      answer: {
        id: answer.id,
        answer_type: answer.answer_type,
        selected_option_id: answer.selected_option_id,
        answer_json: answer.answer_json,
        text_answer: answer.text_answer,
        audio_url: answer.audio_url,
        transcribed_text: answer.transcribed_text,
        score: answer.final_score || answer.score,
        maxScore: answer.max_score,
        percentage: answer.score ? Math.round((answer.score / answer.max_score) * 100) : null,
        gradedBy: answer.graded_by,
        autoGradedAt: answer.auto_graded_at,
        aiGradedAt: answer.ai_graded_at,
        reviewedBy: answer.reviewed_by,
        reviewedAt: answer.reviewed_at,
        needsReview: answer.needs_review,
        answeredAt: answer.answered_at,
      },
      question: {
        id: answer.question.id,
        content: answer.question.content,
        difficulty: answer.question.difficulty,
        questionType: {
          name: answer.question.questionType.question_type_name,
          code: answer.question.questionType.code,
          scoringMethod: answer.question.questionType.scoring_method,
        },
      },
      feedback: {
        aiFeedback,
        aiFeedbackDetails,
        manualFeedback: answer.manual_feedback,
        hasDetailedFeedback: !!aiFeedbackDetails && aiFeedbackDetails.length > 0,
      },
    };

    return successResponse(res, 'Answer feedback retrieved successfully', feedbackData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all answers for an attempt with basic feedback
 */
exports.getAttemptAnswers = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const studentId = req.user.userId;

    // Verify attempt belongs to student
    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
    });

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: answers } = await AttemptAnswer.findAndCountAll({
      where: { attempt_id: attemptId },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'content', 'difficulty'],
          include: [
            {
              model: QuestionType,
              as: 'questionType',
              attributes: ['question_type_name', 'code', 'scoring_method'],
            },
          ],
        },
      ],
      offset,
      limit: parseInt(limit),
      order: [['answered_at', 'ASC']],
    });

    const answersData = answers.map((answer) => {
      // Parse AI feedback if available
      let aiFeedback = null;
      if (answer.ai_feedback) {
        try {
          aiFeedback =
            typeof answer.ai_feedback === 'string'
              ? JSON.parse(answer.ai_feedback)
              : answer.ai_feedback;
        } catch (e) {
          aiFeedback = answer.ai_feedback;
        }
      }

      return {
        id: answer.id,
        questionId: answer.question_id,
        answerType: answer.answer_type,
        score: answer.final_score || answer.score,
        maxScore: answer.max_score,
        percentage: answer.score ? Math.round((answer.score / answer.max_score) * 100) : null,
        gradedBy: answer.graded_by,
        needsReview: answer.needs_review,
        hasManualFeedback: !!answer.manual_feedback,
        hasAiFeedback: !!aiFeedback,
        question: {
          content: answer.question.content.substring(0, 100) + '...', // Truncated content
          difficulty: answer.question.difficulty,
          questionType: answer.question.questionType.question_type_name,
          scoringMethod: answer.question.questionType.scoring_method,
        },
        answeredAt: answer.answered_at,
      };
    });

    return successResponse(res, 'Attempt answers retrieved successfully', {
      answers: answersData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
