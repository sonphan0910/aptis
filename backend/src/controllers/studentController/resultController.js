const {
  ExamAttempt,
  AttemptAnswer,
  AnswerAiFeedback,
  AiScoringCriteria,
  AttemptSection,
  ExamSection,
  ExamSectionQuestion,
  Question,
  QuestionType,
  SkillType,
  Exam,
} = require('../../models');
const { NotFoundError } = require('../../utils/errors');

/**
 * Get attempt results
 */
exports.getResults = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.userId;

    const attempt = await ExamAttempt.findOne({
      where: { id: attemptId, student_id: studentId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'total_score', 'duration_minutes'],
        },
        {
          model: AttemptSection,
          as: 'sections',
          include: [
            {
              model: ExamSection,
              as: 'examSection',
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

    // Calculate section scores and max scores
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'content'],
          include: [
            {
              model: QuestionType,
              as: 'questionType',
              attributes: ['id', 'code', 'question_type_name', 'scoring_method'],
            },
          ],
        },
      ],
    });

    // Get section questions with max scores
    const sectionScores = {};
    for (const section of attempt.sections) {
      // Get all questions for this section
      const sectionQuestions = await ExamSectionQuestion.findAll({
        where: { exam_section_id: section.exam_section_id },
        attributes: ['question_id', 'max_score'],
      });

      // Calculate section max score
      const sectionMaxScore = sectionQuestions.reduce((sum, sq) => {
        return sum + parseFloat(sq.max_score || 0);
      }, 0);

      // Get answers for this section's questions
      const questionIds = sectionQuestions.map(sq => sq.question_id);
      const sectionAnswers = answers.filter(a => questionIds.includes(a.question_id));

      // Calculate section score
      const sectionScore = sectionAnswers.reduce((sum, a) => {
        const score = a.final_score !== null ? a.final_score : a.score || 0;
        return sum + parseFloat(score);
      }, 0);

      sectionScores[section.exam_section_id] = {
        section: {
          ...section.examSection.toJSON(),
          section_max_score: Math.round(sectionMaxScore * 100) / 100,
        },
        score: Math.round(sectionScore * 100) / 100,
      };
    }

    // Get all answers with AI feedbacks for detailed results
    const answersWithFeedback = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
      include: [
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'content'],
          include: [
            {
              model: QuestionType,
              as: 'questionType',
              attributes: ['id', 'code', 'question_type_name', 'scoring_method'],
            },
          ],
        },
        {
          model: AnswerAiFeedback,
          as: 'aiFeedbacks',
          include: [
            {
              model: AiScoringCriteria,
              as: 'criteria',
              attributes: ['id', 'criteria_name', 'description', 'weight'],
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        attempt,
        sectionScores,
        answers: answersWithFeedback,
        totalScore: attempt.total_score,
        status: attempt.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get answer feedback details
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

    const answer = await AttemptAnswer.findOne({
      where: { id: answerId, attempt_id: attemptId },
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
