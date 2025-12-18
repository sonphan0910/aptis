require('dotenv').config();
const {
  Exam,
  ExamSection,
  ExamSectionQuestion,
  Question,
  AptisType,
  SkillType,
  QuestionType,
  User,
} = require('../models');

/**
 * Seed sample exams with sections and questions
 */
async function seedExams() {
  try {
    console.log('[Seed] Seeding sample exams...');

    // Get references
    const aptisGeneral = await AptisType.findOne({ where: { code: 'APTIS_GENERAL' } });
    const teacher = await User.findOne({ where: { role: 'teacher' } });

    if (!aptisGeneral || !teacher) {
      throw new Error('Required APTIS type or teacher user not found');
    }

    // Get skill types
    const grammarSkill = await SkillType.findOne({ where: { code: 'GRAMMAR_VOCABULARY' } });
    const readingSkill = await SkillType.findOne({ where: { code: 'READING' } });
    const listeningSkill = await SkillType.findOne({ where: { code: 'LISTENING' } });
    const writingSkill = await SkillType.findOne({ where: { code: 'WRITING' } });
    const speakingSkill = await SkillType.findOne({ where: { code: 'SPEAKING' } });

    // Create Full APTIS General Exam
    await createFullExam(aptisGeneral, teacher, [
      grammarSkill,
      readingSkill,
      listeningSkill,
      writingSkill,
      speakingSkill,
    ]);

    // Create Grammar & Vocabulary Only Exam
    await createSkillSpecificExam(aptisGeneral, teacher, grammarSkill);

    // Create Writing Only Exam
    await createSkillSpecificExam(aptisGeneral, teacher, writingSkill);

    // Create Speaking Only Exam
    await createSkillSpecificExam(aptisGeneral, teacher, speakingSkill);

    console.log('[Seed] Sample exams seeded successfully');
  } catch (error) {
    console.error('[Seed] Failed to seed exams:', error);
    throw error;
  }
}

/**
 * Create a full APTIS exam with all skills
 */
async function createFullExam(aptisType, teacher, skills) {
  const [exam] = await Exam.findOrCreate({
    where: {
      aptis_type_id: aptisType.id,
      title: 'APTIS General - Full Exam',
    },
    defaults: {
      aptis_type_id: aptisType.id,
      title: 'APTIS General - Full Exam',
      description: 'Complete APTIS General exam testing all language skills',
      duration_minutes: 180, // 3 hours
      total_score: 100,
      created_by: teacher.id,
      status: 'published',
    },
  });

  let sectionOrder = 1;

  // Grammar & Vocabulary Section (25 points)
  if (skills.find((s) => s.code === 'GRAMMAR_VOCABULARY')) {
    await createExamSection(
      exam.id,
      skills.find((s) => s.code === 'GRAMMAR_VOCABULARY'),
      sectionOrder++,
      30,
      'Complete the grammar and vocabulary exercises',
      25,
    );
  }

  // Reading Section (20 points)
  if (skills.find((s) => s.code === 'READING')) {
    await createExamSection(
      exam.id,
      skills.find((s) => s.code === 'READING'),
      sectionOrder++,
      35,
      'Read the passages and answer the questions',
      20,
    );
  }

  // Listening Section (20 points)
  if (skills.find((s) => s.code === 'LISTENING')) {
    await createExamSection(
      exam.id,
      skills.find((s) => s.code === 'LISTENING'),
      sectionOrder++,
      30,
      'Listen to the audio recordings and answer the questions',
      20,
    );
  }

  // Writing Section (20 points)
  if (skills.find((s) => s.code === 'WRITING')) {
    await createExamSection(
      exam.id,
      skills.find((s) => s.code === 'WRITING'),
      sectionOrder++,
      45,
      'Complete the writing tasks',
      20,
    );
  }

  // Speaking Section (15 points)
  if (skills.find((s) => s.code === 'SPEAKING')) {
    await createExamSection(
      exam.id,
      skills.find((s) => s.code === 'SPEAKING'),
      sectionOrder++,
      20,
      'Complete the speaking tasks',
      15,
    );
  }
}

/**
 * Create skill-specific exam
 */
async function createSkillSpecificExam(aptisType, teacher, skill) {
  const skillName = skill.skill_type_name;
  const [exam] = await Exam.findOrCreate({
    where: {
      aptis_type_id: aptisType.id,
      title: `APTIS General - ${skillName} Test`,
    },
    defaults: {
      aptis_type_id: aptisType.id,
      title: `APTIS General - ${skillName} Test`,
      description: `${skillName} skill assessment for APTIS General`,
      duration_minutes: getDurationForSkill(skill.code),
      total_score: 50,
      created_by: teacher.id,
      status: 'published',
    },
  });

  // Create single section for this skill
  await createExamSection(
    exam.id,
    skill,
    1,
    getDurationForSkill(skill.code),
    getInstructionForSkill(skill.code),
    50,
  );
}

/**
 * Create an exam section with questions
 */
async function createExamSection(
  examId,
  skill,
  sectionOrder,
  durationMinutes,
  instruction,
  maxScore,
) {
  const [section] = await ExamSection.findOrCreate({
    where: {
      exam_id: examId,
      skill_type_id: skill.id,
      section_order: sectionOrder,
    },
    defaults: {
      exam_id: examId,
      skill_type_id: skill.id,
      section_order: sectionOrder,
      duration_minutes: durationMinutes,
      instruction: instruction,
    },
  });

  // Get question types for this skill
  const questionTypes = await QuestionType.findAll({
    where: { skill_type_id: skill.id },
  });

  let questionOrder = 1;
  let remainingScore = maxScore;

  for (const qType of questionTypes) {
    // Get questions of this type
    const questions = await Question.findAll({
      where: {
        question_type_id: qType.id,
        status: 'active',
      },
      limit: getQuestionsPerType(qType.code),
    });

    for (const question of questions) {
      const scorePerQuestion =
        Math.floor(remainingScore / (questionTypes.length * questions.length)) || 1;

      await ExamSectionQuestion.findOrCreate({
        where: {
          exam_section_id: section.id,
          question_id: question.id,
        },
        defaults: {
          exam_section_id: section.id,
          question_id: question.id,
          question_order: questionOrder++,
          max_score: scorePerQuestion,
        },
      });

      remainingScore -= scorePerQuestion;
      if (remainingScore <= 0) {
        remainingScore = 1;
      } // Ensure minimum score
    }
  }
}

/**
 * Get duration in minutes for skill
 */
function getDurationForSkill(skillCode) {
  switch (skillCode) {
    case 'GRAMMAR_VOCABULARY':
      return 30;
    case 'READING':
      return 35;
    case 'LISTENING':
      return 30;
    case 'WRITING':
      return 45;
    case 'SPEAKING':
      return 20;
    default:
      return 30;
  }
}

/**
 * Get instruction for skill
 */
function getInstructionForSkill(skillCode) {
  switch (skillCode) {
    case 'GRAMMAR_VOCABULARY':
      return 'This section tests your knowledge of English grammar and vocabulary. Choose the best answer for each question.';
    case 'READING':
      return 'Read each passage carefully and answer the questions that follow. You may refer back to the passages.';
    case 'LISTENING':
      return 'Listen to each recording. You may hear each recording twice. Answer the questions based on what you hear.';
    case 'WRITING':
      return 'Complete the writing tasks. Pay attention to word count limits and follow the instructions carefully.';
    case 'SPEAKING':
      return 'You will be asked to speak about various topics. Speak clearly and try to use the full time allocated.';
    default:
      return 'Follow the instructions for each question carefully.';
  }
}

/**
 * Get number of questions per question type
 */
function getQuestionsPerType(questionTypeCode) {
  // Return 1 question per type for sample data
  // In real application, this would vary
  return 1;
}

// Run if called directly
if (require.main === module) {
  seedExams()
    .then(() => {
      console.log('[Seed] Exams seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Seed] Failed to seed exams:', error);
      process.exit(1);
    });
}

module.exports = seedExams;
