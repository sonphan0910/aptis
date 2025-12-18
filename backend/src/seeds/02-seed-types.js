require('dotenv').config();
const { AptisType, SkillType, QuestionType } = require('../models');

/**
 * Seed APTIS types
 */
async function seedAptisTypes() {
  const types = [
    {
      code: 'APTIS_GENERAL',
      aptis_type_name: 'APTIS General',
      description: 'General English test for all purposes',
      is_active: true,
    },
    {
      code: 'APTIS_ADVANCED',
      aptis_type_name: 'APTIS Advanced',
      description: 'Advanced level English test',
      is_active: true,
    },
    {
      code: 'APTIS_FOR_TEACHERS',
      aptis_type_name: 'APTIS for Teachers',
      description: 'English test specifically for teachers',
      is_active: true,
    },
    {
      code: 'APTIS_FOR_TEENS',
      aptis_type_name: 'APTIS for Teens',
      description: 'English test for teenagers (13-17)',
      is_active: true,
    },
  ];

  for (const type of types) {
    await AptisType.findOrCreate({
      where: { code: type.code },
      defaults: type,
    });
  }

  console.log(`[Seed] ${types.length} APTIS types seeded`);
}

/**
 * Seed skill types
 */
async function seedSkillTypes() {
  const skills = [
    {
      code: 'GRAMMAR_VOCABULARY',
      skill_type_name: 'Grammar and Vocabulary',
      description: 'Test grammar rules and vocabulary knowledge',
      display_order: 1,
    },
    {
      code: 'READING',
      skill_type_name: 'Reading',
      description: 'Test reading comprehension skills',
      display_order: 2,
    },
    {
      code: 'LISTENING',
      skill_type_name: 'Listening',
      description: 'Test listening comprehension skills',
      display_order: 3,
    },
    {
      code: 'WRITING',
      skill_type_name: 'Writing',
      description: 'Test written communication skills',
      display_order: 4,
    },
    {
      code: 'SPEAKING',
      skill_type_name: 'Speaking',
      description: 'Test spoken communication skills',
      display_order: 5,
    },
  ];

  for (const skill of skills) {
    await SkillType.findOrCreate({
      where: { code: skill.code },
      defaults: skill,
    });
  }

  console.log(`[Seed] ${skills.length} skill types seeded`);
}

/**
 * Seed question types
 */
async function seedQuestionTypes() {
  // Get skill IDs
  const grammarVocab = await SkillType.findOne({ where: { code: 'GRAMMAR_VOCABULARY' } });
  const reading = await SkillType.findOne({ where: { code: 'READING' } });
  const listening = await SkillType.findOne({ where: { code: 'LISTENING' } });
  const writing = await SkillType.findOne({ where: { code: 'WRITING' } });
  const speaking = await SkillType.findOne({ where: { code: 'SPEAKING' } });

  const types = [
    // Grammar & Vocabulary
    {
      skill_type_id: grammarVocab.id,
      code: 'GV_MCQ',
      question_type_name: 'Multiple Choice',
      scoring_method: 'auto',
    },
    {
      skill_type_id: grammarVocab.id,
      code: 'GV_GAP_FILL',
      question_type_name: 'Gap Filling',
      scoring_method: 'auto',
    },
    {
      skill_type_id: grammarVocab.id,
      code: 'GV_MATCHING',
      question_type_name: 'Matching',
      scoring_method: 'auto',
    },

    // Reading
    {
      skill_type_id: reading.id,
      code: 'READING_MCQ',
      question_type_name: 'Multiple Choice',
      scoring_method: 'auto',
    },
    {
      skill_type_id: reading.id,
      code: 'READING_TRUE_FALSE',
      question_type_name: 'True/False',
      scoring_method: 'auto',
    },
    {
      skill_type_id: reading.id,
      code: 'READING_MATCHING',
      question_type_name: 'Matching Headings',
      scoring_method: 'auto',
    },
    {
      skill_type_id: reading.id,
      code: 'READING_SHORT_ANSWER',
      question_type_name: 'Short Answer',
      scoring_method: 'ai',
    },

    // Listening
    {
      skill_type_id: listening.id,
      code: 'LISTENING_MCQ',
      question_type_name: 'Multiple Choice',
      scoring_method: 'auto',
    },
    {
      skill_type_id: listening.id,
      code: 'LISTENING_GAP_FILL',
      question_type_name: 'Gap Filling',
      scoring_method: 'auto',
    },
    {
      skill_type_id: listening.id,
      code: 'LISTENING_MATCHING',
      question_type_name: 'Matching',
      scoring_method: 'auto',
    },
    {
      skill_type_id: listening.id,
      code: 'LISTENING_NOTE_COMPLETION',
      question_type_name: 'Note Completion',
      scoring_method: 'auto',
    },

    // Writing
    {
      skill_type_id: writing.id,
      code: 'WRITING_SHORT',
      question_type_name: 'Short Writing (50-100 words)',
      scoring_method: 'ai',
    },
    {
      skill_type_id: writing.id,
      code: 'WRITING_LONG',
      question_type_name: 'Long Writing (150-200 words)',
      scoring_method: 'ai',
    },
    {
      skill_type_id: writing.id,
      code: 'WRITING_EMAIL',
      question_type_name: 'Email Writing',
      scoring_method: 'ai',
    },
    {
      skill_type_id: writing.id,
      code: 'WRITING_ESSAY',
      question_type_name: 'Essay Writing',
      scoring_method: 'ai',
    },

    // Speaking
    {
      skill_type_id: speaking.id,
      code: 'SPEAKING_INTRO',
      question_type_name: 'Personal Introduction',
      scoring_method: 'ai',
    },
    {
      skill_type_id: speaking.id,
      code: 'SPEAKING_DESCRIPTION',
      question_type_name: 'Picture Description',
      scoring_method: 'ai',
    },
    {
      skill_type_id: speaking.id,
      code: 'SPEAKING_COMPARISON',
      question_type_name: 'Comparison',
      scoring_method: 'ai',
    },
    {
      skill_type_id: speaking.id,
      code: 'SPEAKING_DISCUSSION',
      question_type_name: 'Topic Discussion',
      scoring_method: 'ai',
    },
  ];

  for (const type of types) {
    await QuestionType.findOrCreate({
      where: { code: type.code },
      defaults: type,
    });
  }

  console.log(`[Seed] ${types.length} question types seeded`);
}

/**
 * Run all type seeds
 */
async function seedTypes() {
  try {
    console.log('[Seed] Seeding types...');

    await seedAptisTypes();
    await seedSkillTypes();
    await seedQuestionTypes();

    console.log('[Seed] Types seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Failed to seed types:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTypes();
}

module.exports = seedTypes;
