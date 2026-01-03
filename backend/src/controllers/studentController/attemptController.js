const {
  ExamAttempt,
  Exam,
  ExamSection,
  ExamSectionQuestion,
  AttemptSection,
  AttemptAnswer,
  Question,
  QuestionItem,
  QuestionOption,
  QuestionType,
  SkillType,
} = require('../../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../utils/errors');
const { isValidAttemptType } = require('../../utils/validators');
const { SCORING_METHODS } = require('../../utils/constants');
const ScoringService = require('../../services/ScoringService');
const AiScoringService = require('../../services/AiScoringService');
const { addSpeechJob } = require('../../jobs/speechQueue');


/**
 * Start exam attempt
 */
exports.startAttempt = async (req, res, next) => {
  try {
    const { exam_id, attempt_type, selected_skill_id } = req.body;
    const studentId = req.user.userId;

    console.log('[startAttempt] Request body:', { exam_id, attempt_type, selected_skill_id });
    console.log('[startAttempt] StudentId:', studentId);

    // Validate attempt type
    if (!isValidAttemptType(attempt_type, selected_skill_id)) {
      console.log('[startAttempt] Invalid attempt type:', { attempt_type, selected_skill_id });
      throw new BadRequestError('Invalid attempt type or missing selected_skill_id');
    }

    // Check if exam exists and is published
    const exam = await Exam.findOne({
      where: { id: exam_id, status: 'published' },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found or not published');
    }

    // If single_skill attempt, validate that skill exists
    if (attempt_type === 'single_skill' && selected_skill_id) {
      const skill = await SkillType.findByPk(selected_skill_id);
      if (!skill) {
        console.log('[startAttempt] Skill not found:', selected_skill_id);
        throw new BadRequestError(`Skill with ID ${selected_skill_id} not found`);
      }
    }

    // Get next attempt number
    const lastAttempt = await ExamAttempt.findOne({
      where: {
        student_id: studentId,
        exam_id,
        attempt_type,
        selected_skill_id: selected_skill_id || null,
      },
      order: [['attempt_number', 'DESC']],
    });

    const attempt_number = lastAttempt ? lastAttempt.attempt_number + 1 : 1;

    // Create attempt
    const attempt = await ExamAttempt.create({
      student_id: studentId,
      exam_id,
      attempt_type,
      selected_skill_id: selected_skill_id || null,
      attempt_number,
      start_time: new Date(),
      status: 'in_progress',
    });

    // Get exam sections based on attempt type
    const where = { exam_id };
    if (attempt_type === 'single_skill') {
      where.skill_type_id = selected_skill_id;
    }

    const sections = await ExamSection.findAll({
      where,
      include: [
        {
          model: ExamSectionQuestion,
          as: 'questions',
          include: [
            {
              model: Question,
              as: 'question',
              include: [
                { model: QuestionItem, as: 'items' },
                { model: QuestionOption, as: 'options' },
                { model: QuestionType, as: 'questionType' },
              ],
            },
          ],
        },
      ],
      order: [['section_order', 'ASC']],
    });

    // Create attempt sections
    for (const section of sections) {
      await AttemptSection.create({
        attempt_id: attempt.id,
        exam_section_id: section.id,
        section_status: 'not_started',
      });

      // Create attempt answers (empty) - use findOrCreate to avoid duplicates
      for (const esq of section.questions) {
        // Auto-detect answer_type based on question type code
        const questionTypeCode = esq.question.questionType.code.toLowerCase();
        let defaultAnswerType = 'text';
        
        if (questionTypeCode.includes('mcq') || 
            questionTypeCode.includes('true_false') || 
            questionTypeCode.includes('multiple_choice')) {
          defaultAnswerType = 'option';
        } else if (questionTypeCode.includes('speaking')) {
          defaultAnswerType = 'audio';
        } else if (questionTypeCode.includes('matching') || 
                   questionTypeCode.includes('ordering') ||
                   questionTypeCode.includes('gap_filling')) {
          defaultAnswerType = 'json';
        }
        // else: writing, reading short answer, etc. = 'text'
        
        await AttemptAnswer.findOrCreate({
          where: {
            attempt_id: attempt.id,
            question_id: esq.question_id,
          },
          defaults: {
            answer_type: defaultAnswerType,
            max_score: esq.max_score,
          },
        });
      }
    }

    // Reload with lightweight data (NO questions to improve performance)
    const lightAttempt = await ExamAttempt.findByPk(attempt.id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'duration_minutes', 'total_score'],
        },
        {
          model: AttemptSection,
          as: 'sections',
          include: [
            {
              model: ExamSection,
              as: 'examSection',
              attributes: ['id', 'section_order', 'instruction'],
              include: [
                {
                  model: SkillType,
                  as: 'skillType',
                  attributes: ['id', 'code', 'skill_type_name'],
                },
              ],
            },
          ],
        },
      ],
    });

    const plainAttempt = lightAttempt.toJSON();
    
    console.log('[startAttempt] Lightweight attempt created:');
    console.log('[startAttempt] - Attempt ID:', plainAttempt.id);
    console.log('[startAttempt] - Sections count:', plainAttempt.sections?.length || 0);
    console.log('[startAttempt] - Use GET /attempts/:id/questions to load questions progressively');

    res.status(201).json({
      success: true,
      data: {
        ...plainAttempt,
        // Provide metadata for frontend to know how to load questions
        questions_count: await AttemptAnswer.count({ where: { attempt_id: attempt.id } }),
        load_questions_url: `/student/attempts/${attempt.id}/questions`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attempt details (to continue)
 */
exports.getAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.userId;

    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'duration_minutes', 'total_score'],
        },
        {
          model: AttemptSection,
          as: 'sections',
          include: [
            {
              model: ExamSection,
              as: 'examSection',
              attributes: ['id', 'section_order', 'instruction'],
              include: [
                {
                  model: SkillType,
                  as: 'skillType',
                  attributes: ['id', 'code', 'skill_type_name'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    const plainAttempt = attempt.toJSON();
    
    console.log('[getAttempt] Retrieved lightweight attempt:');
    console.log('[getAttempt] - Attempt ID:', plainAttempt.id);
    console.log('[getAttempt] - Use /attempts/:id/questions to load questions');

    res.json({
      success: true,
      data: {
        ...plainAttempt,
        questions_count: await AttemptAnswer.count({ where: { attempt_id: attemptId } }),
        load_questions_url: `/student/attempts/${attemptId}/questions`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit exam
 */
exports.submitAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.userId;

    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
    });

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    if (attempt.status !== 'in_progress') {
      throw new BadRequestError('Attempt already submitted');
    }

    // Update attempt status
    await attempt.update({
      end_time: new Date(),
      status: 'submitted',
    });

    // Calculate total score for auto-graded questions only
    const totalScore = await ScoringService.calculateAttemptScore(attemptId);

    await attempt.update({ total_score: totalScore });

    // Get all answers to check for Writing/Speaking that need AI grading
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
      include: [
        {
          model: Question,
          as: 'question',
          include: [
            {
              model: QuestionType,
              as: 'questionType',
              attributes: ['id', 'code', 'scoring_method'],
            },
          ],
        },
      ],
    });

    // Score Writing and Speaking answers synchronously with AI
    const aiScoringResults = [];
    for (const answer of answers) {
      const questionType = answer.question.questionType;
      
      // Skip if already scored
      if (answer.score !== null && answer.score !== undefined) {
        continue;
      }

      // Check if requires AI scoring
      if (questionType.scoring_method === SCORING_METHODS.AI) {
        const questionCode = questionType.code.toLowerCase();

        if (questionCode.includes('writing')) {
          // Score Writing synchronously
          if (answer.text_answer && answer.text_answer.trim()) {
            try {
              console.log(`[submitAttempt] Scoring Writing answer ${answer.id} synchronously with AI`);
              const result = await AiScoringService.scoreWriting(answer.id);
              aiScoringResults.push({
                answerId: answer.id,
                score: result.totalScore,
                feedback: result.overallFeedback,
                type: 'writing',
                status: 'success'
              });
              console.log(`[submitAttempt] Writing answer ${answer.id} scored: ${result.totalScore}/${result.totalMaxScore}`);
            } catch (error) {
              console.error(`[submitAttempt] Error scoring Writing answer ${answer.id}:`, error.message);
              aiScoringResults.push({
                answerId: answer.id,
                type: 'writing',
                status: 'error',
                error: error.message
              });
            }
          }
        } else if (questionCode.includes('speaking')) {
          // Score Speaking synchronously: transcribe then score with AI
          if (answer.audio_url) {
            try {
              console.log(`[submitAttempt] Processing Speaking answer ${answer.id} synchronously`);
              const result = await AiScoringService.scoreSpeaking(answer.id);
              aiScoringResults.push({
                answerId: answer.id,
                score: result.totalScore,
                feedback: result.overallFeedback,
                type: 'speaking',
                status: 'success'
              });
              console.log(`[submitAttempt] Speaking answer ${answer.id} scored: ${result.totalScore}/${result.totalMaxScore}`);
            } catch (error) {
              console.error(`[submitAttempt] Error scoring Speaking answer ${answer.id}:`, error.message);
              aiScoringResults.push({
                answerId: answer.id,
                type: 'speaking',
                status: 'error',
                error: error.message
              });
            }
          }
        }
      }
    }

    console.log(`[submitAttempt] Attempt ${attemptId} submitted. Scored ${aiScoringResults.filter(r => r.status === 'success').length} answers with AI.`);

    // Recalculate total score after AI scoring (includes newly scored answers)
    const finalScore = await ScoringService.calculateAttemptScore(attemptId);
    await attempt.update({ total_score: finalScore });

    res.json({
      success: true,
      data: {
        attemptId: attempt.id,
        status: attempt.status,
        total_score: finalScore,
        aiScoringResults,
        message: 'Bài thi đã được nộp thành công. Điểm Writing và Speaking đã được cập nhật bằng AI.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get questions for attempt (progressive loading)
 * Query params: section_id, offset, limit
 */
exports.getAttemptQuestions = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { section_id, offset = 0, limit = 999 } = req.query;
    const studentId = req.user.userId;

    console.log('[getAttemptQuestions] Request:', { attemptId, section_id, offset, limit });

    // Verify attempt belongs to student
    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
    });

    if (!attempt) {
      throw new NotFoundError('Attempt not found');
    }

    // Build where clause for filtering
    const where = { attempt_id: attemptId };
    
    // If section_id provided, filter questions by section
    if (section_id) {
      const attemptSection = await AttemptSection.findOne({
        where: { 
          attempt_id: attemptId,
          exam_section_id: section_id 
        },
        include: [{
          model: ExamSection,
          as: 'examSection',
          include: [{
            model: ExamSectionQuestion,
            as: 'questions',
            attributes: ['question_id']
          }]
        }]
      });

      if (attemptSection && attemptSection.examSection) {
        const questionIds = attemptSection.examSection.questions.map(q => q.question_id);
        where.question_id = questionIds;
      }
    }

    // Get answers with questions (optimized query)
    const answers = await AttemptAnswer.findAll({
      where,
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'question_type_id', 'aptis_type_id', 'difficulty', 'content', 'media_url', 'duration_seconds', 'status'],
          include: [
            { 
              model: QuestionItem, 
              as: 'items',
              separate: true, // Prevent cartesian product
              order: [['item_order', 'ASC']]
            },
            { 
              model: QuestionOption, 
              as: 'options',
              separate: true, // Prevent cartesian product
              order: [['option_order', 'ASC']]
            },
            { 
              model: QuestionType, 
              as: 'questionType',
              attributes: ['id', 'code', 'question_type_name', 'scoring_method']
            },
          ],
        },
      ],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['id', 'ASC']],
    });

    // Get total count
    const totalCount = await AttemptAnswer.count({ where });

    console.log('[getAttemptQuestions] Loaded', answers.length, 'questions, total:', totalCount);

    // Format answers with answer_data for frontend consumption
    const formattedAnswers = answers.map(answer => {
      const answerJson = answer.toJSON();
      
      // Log media_url for debugging
      if (answerJson.question?.media_url) {
        console.log('[getAttemptQuestions] Q' + answerJson.question.id + ' has media_url:', answerJson.question.media_url);
      }
      
      // Create answer_data structure based on answer_type
      let answer_data = null;
      
      if (answer.answer_type === 'option' && answer.selected_option_id) {
        answer_data = { selected_option_id: answer.selected_option_id };
      } else if (answer.answer_type === 'json' && answer.answer_json) {
        try {
          answer_data = JSON.parse(answer.answer_json);
        } catch (e) {
          answer_data = answer.answer_json;
        }
      } else if (answer.answer_type === 'text' && answer.text_answer) {
        answer_data = { text_answer: answer.text_answer };
      } else if (answer.answer_type === 'audio' && answer.audio_url) {
        // For audio answers, just mark as completed - don't need to load audio file
        answer_data = { 
          audio_url: answer.audio_url,
          completed: true,
          transcribed_text: answer.transcribed_text || null
        };
      }
      
      return {
        ...answerJson,
        answer_data
      };
    });

    res.json({
      success: true,
      data: {
        answers: formattedAnswers,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: totalCount,
          hasMore: parseInt(offset) + answers.length < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('[getAttemptQuestions] Error:', error);
    next(error);
  }
};
