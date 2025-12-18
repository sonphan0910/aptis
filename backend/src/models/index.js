const { sequelize, Sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const AptisType = require('./AptisType');
const SkillType = require('./SkillType');
const QuestionType = require('./QuestionType');
const Question = require('./Question');
const QuestionItem = require('./QuestionItem');
const QuestionOption = require('./QuestionOption');
const QuestionSampleAnswer = require('./QuestionSampleAnswer');
const AiScoringCriteria = require('./AiScoringCriteria');
const Exam = require('./Exam');
const ExamSection = require('./ExamSection');
const ExamSectionQuestion = require('./ExamSectionQuestion');
const ExamAttempt = require('./ExamAttempt');
const AttemptSection = require('./AttemptSection');
const AttemptAnswer = require('./AttemptAnswer');
const AnswerAiFeedback = require('./AnswerAiFeedback');

// Define associations

// QuestionType belongs to SkillType
QuestionType.belongsTo(SkillType, {
  foreignKey: 'skill_type_id',
  as: 'skillType',
});
SkillType.hasMany(QuestionType, {
  foreignKey: 'skill_type_id',
  as: 'questionTypes',
});

// Question belongs to QuestionType and AptisType
Question.belongsTo(QuestionType, {
  foreignKey: 'question_type_id',
  as: 'questionType',
});
Question.belongsTo(AptisType, {
  foreignKey: 'aptis_type_id',
  as: 'aptisType',
});
Question.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

QuestionType.hasMany(Question, {
  foreignKey: 'question_type_id',
  as: 'questions',
});
AptisType.hasMany(Question, {
  foreignKey: 'aptis_type_id',
  as: 'questions',
});
User.hasMany(Question, {
  foreignKey: 'created_by',
  as: 'createdQuestions',
});

// QuestionItem belongs to Question
QuestionItem.belongsTo(Question, {
  foreignKey: 'question_id',
  as: 'question',
});
Question.hasMany(QuestionItem, {
  foreignKey: 'question_id',
  as: 'items',
});

// QuestionOption belongs to Question and optionally QuestionItem
QuestionOption.belongsTo(Question, {
  foreignKey: 'question_id',
  as: 'question',
});
QuestionOption.belongsTo(QuestionItem, {
  foreignKey: 'item_id',
  as: 'item',
});
Question.hasMany(QuestionOption, {
  foreignKey: 'question_id',
  as: 'options',
});
QuestionItem.hasMany(QuestionOption, {
  foreignKey: 'item_id',
  as: 'options',
});

// QuestionSampleAnswer belongs to Question
QuestionSampleAnswer.belongsTo(Question, {
  foreignKey: 'question_id',
  as: 'question',
});
Question.hasOne(QuestionSampleAnswer, {
  foreignKey: 'question_id',
  as: 'sampleAnswer',
});

// AiScoringCriteria belongs to AptisType, QuestionType, and User
AiScoringCriteria.belongsTo(AptisType, {
  foreignKey: 'aptis_type_id',
  as: 'aptisType',
});
AiScoringCriteria.belongsTo(QuestionType, {
  foreignKey: 'question_type_id',
  as: 'questionType',
});
AiScoringCriteria.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

AptisType.hasMany(AiScoringCriteria, {
  foreignKey: 'aptis_type_id',
  as: 'scoringCriteria',
});
QuestionType.hasMany(AiScoringCriteria, {
  foreignKey: 'question_type_id',
  as: 'scoringCriteria',
});
User.hasMany(AiScoringCriteria, {
  foreignKey: 'created_by',
  as: 'createdCriteria',
});

// Exam belongs to AptisType and User
Exam.belongsTo(AptisType, {
  foreignKey: 'aptis_type_id',
  as: 'aptisType',
});
Exam.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

AptisType.hasMany(Exam, {
  foreignKey: 'aptis_type_id',
  as: 'exams',
});
User.hasMany(Exam, {
  foreignKey: 'created_by',
  as: 'createdExams',
});

// ExamSection belongs to Exam and SkillType
ExamSection.belongsTo(Exam, {
  foreignKey: 'exam_id',
  as: 'exam',
});
ExamSection.belongsTo(SkillType, {
  foreignKey: 'skill_type_id',
  as: 'skillType',
});

Exam.hasMany(ExamSection, {
  foreignKey: 'exam_id',
  as: 'sections',
});
SkillType.hasMany(ExamSection, {
  foreignKey: 'skill_type_id',
  as: 'examSections',
});

// ExamSectionQuestion belongs to ExamSection and Question
ExamSectionQuestion.belongsTo(ExamSection, {
  foreignKey: 'exam_section_id',
  as: 'examSection',
});
ExamSectionQuestion.belongsTo(Question, {
  foreignKey: 'question_id',
  as: 'question',
});

ExamSection.hasMany(ExamSectionQuestion, {
  foreignKey: 'exam_section_id',
  as: 'questions',
});
Question.hasMany(ExamSectionQuestion, {
  foreignKey: 'question_id',
  as: 'examSectionQuestions',
});

// ExamAttempt belongs to User, Exam, and optionally SkillType
ExamAttempt.belongsTo(User, {
  foreignKey: 'student_id',
  as: 'student',
});
ExamAttempt.belongsTo(Exam, {
  foreignKey: 'exam_id',
  as: 'exam',
});
ExamAttempt.belongsTo(SkillType, {
  foreignKey: 'selected_skill_id',
  as: 'selectedSkill',
});

User.hasMany(ExamAttempt, {
  foreignKey: 'student_id',
  as: 'examAttempts',
});
Exam.hasMany(ExamAttempt, {
  foreignKey: 'exam_id',
  as: 'attempts',
});
SkillType.hasMany(ExamAttempt, {
  foreignKey: 'selected_skill_id',
  as: 'singleSkillAttempts',
});

// AttemptSection belongs to ExamAttempt and ExamSection
AttemptSection.belongsTo(ExamAttempt, {
  foreignKey: 'attempt_id',
  as: 'attempt',
});
AttemptSection.belongsTo(ExamSection, {
  foreignKey: 'exam_section_id',
  as: 'examSection',
});

ExamAttempt.hasMany(AttemptSection, {
  foreignKey: 'attempt_id',
  as: 'sections',
});
ExamSection.hasMany(AttemptSection, {
  foreignKey: 'exam_section_id',
  as: 'attemptSections',
});

// AttemptAnswer belongs to ExamAttempt, Question, QuestionOption, and Users
AttemptAnswer.belongsTo(ExamAttempt, {
  foreignKey: 'attempt_id',
  as: 'attempt',
});
AttemptAnswer.belongsTo(Question, {
  foreignKey: 'question_id',
  as: 'question',
});
AttemptAnswer.belongsTo(QuestionOption, {
  foreignKey: 'selected_option_id',
  as: 'selectedOption',
});
AttemptAnswer.belongsTo(User, {
  foreignKey: 'graded_by',
  as: 'grader',
});
AttemptAnswer.belongsTo(User, {
  foreignKey: 'reviewed_by',
  as: 'reviewer',
});

ExamAttempt.hasMany(AttemptAnswer, {
  foreignKey: 'attempt_id',
  as: 'answers',
});
Question.hasMany(AttemptAnswer, {
  foreignKey: 'question_id',
  as: 'attemptAnswers',
});
User.hasMany(AttemptAnswer, {
  foreignKey: 'graded_by',
  as: 'gradedAnswers',
});
User.hasMany(AttemptAnswer, {
  foreignKey: 'reviewed_by',
  as: 'reviewedAnswers',
});

// AnswerAiFeedback belongs to AttemptAnswer and AiScoringCriteria
AnswerAiFeedback.belongsTo(AttemptAnswer, {
  foreignKey: 'answer_id',
  as: 'answer',
});
AnswerAiFeedback.belongsTo(AiScoringCriteria, {
  foreignKey: 'criteria_id',
  as: 'criteria',
});

AttemptAnswer.hasMany(AnswerAiFeedback, {
  foreignKey: 'answer_id',
  as: 'aiFeedbacks',
});
AiScoringCriteria.hasMany(AnswerAiFeedback, {
  foreignKey: 'criteria_id',
  as: 'feedbacks',
});

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log(
      `✅ Database synced successfully ${force ? '(FORCE MODE - All data dropped)' : ''}`,
    );
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  syncDatabase,
  // Models
  User,
  AptisType,
  SkillType,
  QuestionType,
  Question,
  QuestionItem,
  QuestionOption,
  QuestionSampleAnswer,
  AiScoringCriteria,
  Exam,
  ExamSection,
  ExamSectionQuestion,
  ExamAttempt,
  AttemptSection,
  AttemptAnswer,
  AnswerAiFeedback,
};
