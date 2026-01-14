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
const AiScoringService = require('../../services/AiScoringService');
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

    // Reject incomplete saves (no answer_type = audio answer trying to save via wrong endpoint)
    if (!answer_type || (!selected_option_id && !answer_json && !text_answer && !audio_url)) {
      throw new BadRequestError('Audio answers must use /answers/audio endpoint');
    }

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

    // Score answer based on question type
    let score = null;
    try {
      if (answer.question.questionType.scoring_method === 'auto') {
        // Auto-grade for MCQ, Gap Filling, Matching, Ordering, etc.
        score = await ScoringService.autoGradeAnswer(answer.id);
      } else if (answer.question.questionType.scoring_method === 'ai') {
        // AI-grade for Writing and Speaking - DISABLED TO SCORE ONLY WHEN VIEWING RESULTS
        console.log(`[saveAnswer] AI scoring disabled for realtime - will score when viewing results`);
        
        // TODO: Remove this comment and uncomment below lines if you want realtime AI scoring back
        // if (answer.question.questionType.code.includes('WRITING') && (text_answer || answer_json)) {
        //   console.log(`[saveAnswer] Triggering AI scoring for writing answer ${answer.id} (format: ${text_answer ? 'text_answer' : 'answer_json'})`);
        //   await AiScoringService.scoreWriting(answer.id);
        //   score = (await AttemptAnswer.findByPk(answer.id)).score; // Get updated score
        // } else if (answer.question.questionType.code.includes('SPEAKING') && audio_url) {
        //   console.log(`[saveAnswer] AI scoring for speaking will be handled by speech-to-text process`);
        //   // Speaking will be scored after transcription in the audio upload process
        // } else {
        //   console.log(`[saveAnswer] AI scoring skipped - missing required data for question type ${answer.question.questionType.code}`);
        // }
      }
    } catch (error) {
      console.error(`[saveAnswer] Error scoring answer ${answer.id}:`, error.message);
      // Don't throw error, just log it - answer is saved even if scoring fails
    }

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
      answerData.answer_data = { selected_option_id: updatedAnswer.selected_option_id };
    } else if (updatedAnswer.answer_type === 'json' && updatedAnswer.answer_json) {
      try {
        const parsed = JSON.parse(updatedAnswer.answer_json);
        answerData.answer_data = parsed;
      } catch (e) {
        answerData.answer_data = updatedAnswer.answer_json;
      }
    } else if (updatedAnswer.answer_type === 'text' && updatedAnswer.text_answer) {
      answerData.answer_data = { text_answer: updatedAnswer.text_answer };
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
    console.log('[uploadAudioAnswer] ========== START ==========');
    const { attemptId } = req.params;
    const { question_id, duration } = req.body;
    const studentId = req.user.userId;

    console.log('[uploadAudioAnswer] Request info:');
    console.log('[uploadAudioAnswer] - attemptId:', attemptId);
    console.log('[uploadAudioAnswer] - question_id:', question_id);
    console.log('[uploadAudioAnswer] - duration:', duration);
    console.log('[uploadAudioAnswer] - studentId:', studentId);
    console.log('[uploadAudioAnswer] - file exists:', !!req.file);
    if (req.file) {
      console.log('[uploadAudioAnswer] - filename:', req.file.filename);
      console.log('[uploadAudioAnswer] - originalname:', req.file.originalname);
      console.log('[uploadAudioAnswer] - size:', req.file.size, 'bytes');
      console.log('[uploadAudioAnswer] - mimetype:', req.file.mimetype);
      console.log('[uploadAudioAnswer] - path:', req.file.path);
    }

    // Validate basic inputs
    if (!attemptId) {
      console.error('[uploadAudioAnswer] ❌ Missing attemptId');
      throw new BadRequestError('Attempt ID is required');
    }

    if (!question_id) {
      console.error('[uploadAudioAnswer] ❌ Missing question_id');
      throw new BadRequestError('Question ID is required');
    }

    if (!req.file) {
      console.error('[uploadAudioAnswer] ❌ No audio file uploaded');
      throw new BadRequestError('No audio file uploaded');
    }

    // Verify attempt belongs to student
    console.log('[uploadAudioAnswer] 🔍 Verifying attempt...');
    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
    });

    if (!attempt) {
      console.error('[uploadAudioAnswer] ❌ Attempt not found or does not belong to student');
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status !== 'in_progress') {
      console.error('[uploadAudioAnswer] ❌ Invalid attempt status:', attempt.status);
      throw new BadRequestError('Attempt is not in progress. Cannot upload answer.');
    }

    console.log('[uploadAudioAnswer] ✓ Attempt verified, status:', attempt.status);

    // Validate audio file
    console.log('[uploadAudioAnswer] 🔍 Validating audio file...');
    try {
      SpeechToTextService.validateAudioFile(req.file);
    } catch (validationError) {
      console.error('[uploadAudioAnswer] ❌ Audio validation failed:', validationError.message);
      throw validationError;
    }
    console.log('[uploadAudioAnswer] ✓ Audio file validation passed');

    // Upload audio
    console.log('[uploadAudioAnswer] 📤 Processing audio file...');
    let audioInfo;
    try {
      audioInfo = await SpeechToTextService.uploadAudioFile(req.file);
    } catch (uploadError) {
      console.error('[uploadAudioAnswer] ❌ Audio upload failed:', uploadError.message);
      throw new BadRequestError('Failed to process audio file: ' + uploadError.message);
    }
    console.log('[uploadAudioAnswer] ✓ Audio processed successfully');
    console.log('[uploadAudioAnswer] - url:', audioInfo.url);
    console.log('[uploadAudioAnswer] - duration:', audioInfo.duration);
    console.log('[uploadAudioAnswer] - size:', audioInfo.size);

    // Verify answer exists
    console.log('[uploadAudioAnswer] 🔍 Finding answer record...');
    const answer = await AttemptAnswer.findOne({
      where: { 
        attempt_id: attemptId, 
        question_id: question_id 
      },
    });

    if (!answer) {
      console.error('[uploadAudioAnswer] ❌ Answer not found for question:', question_id);
      // Clean up uploaded file if answer not found
      try {
        await SpeechToTextService.deleteAudioFile(audioInfo.path);
      } catch (deleteError) {
        console.warn('[uploadAudioAnswer] ⚠️ Failed to clean up file:', deleteError.message);
      }
      throw new NotFoundError('Answer record not found for this question');
    }

    console.log('[uploadAudioAnswer] ✓ Answer found, id:', answer.id);

    // Update answer with audio
    console.log('[uploadAudioAnswer] 💾 Updating answer record with audio...');
    try {
      await answer.update({
        answer_type: 'audio',
        audio_url: audioInfo.url,
        answered_at: new Date(),
      });
      console.log('[uploadAudioAnswer] ✓ Answer updated successfully');
    } catch (updateError) {
      console.error('[uploadAudioAnswer] ❌ Failed to update answer:', updateError.message);
      // Clean up uploaded file if update fails
      try {
        await SpeechToTextService.deleteAudioFile(audioInfo.path);
      } catch (deleteError) {
        console.warn('[uploadAudioAnswer] ⚠️ Failed to clean up file:', deleteError.message);
      }
      throw new BadRequestError('Failed to save answer: ' + updateError.message);
    }

    console.log('[uploadAudioAnswer] ========== SUCCESS ==========\n');

    return successResponse(res, 'Audio answer uploaded successfully', {
      answerId: answer.id,
      audio_url: audioInfo.url,
      duration: audioInfo.duration || duration,
      fileSize: audioInfo.size,
    });
  } catch (error) {
    console.error('[uploadAudioAnswer] ========== ERROR ==========');
    console.error('[uploadAudioAnswer] ❌ Error:', error.message);
    console.error('[uploadAudioAnswer] Stack:', error.stack);
    console.error('[uploadAudioAnswer] ========== END ERROR ==========\n');
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
      // New approach: Single feedback record per answer
      const aiFeedback = await AnswerAiFeedback.findOne({
        where: { answer_id: answerId },
        order: [['id', 'DESC']], // Get latest feedback
      });

      if (aiFeedback) {
        // Since we now store single feedback for entire answer, present it as overall feedback
        aiFeedbackDetails = {
          overall: {
            score: aiFeedback.score,
            maxScore: answer.question?.max_score || 10,
            percentage: Math.round((aiFeedback.score / (answer.question?.max_score || 10)) * 100),
            comment: aiFeedback.comment,
            suggestions: aiFeedback.suggestions,
            strengths: aiFeedback.strengths,
            weaknesses: aiFeedback.weaknesses,
            cefrLevel: aiFeedback.cefr_level,
          },
          // Keep criteria structure for backward compatibility if needed
          criteria: [] // No longer used but kept for API compatibility
        };
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
