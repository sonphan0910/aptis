require('dotenv').config();
const { AiScoringCriteria, AptisType, QuestionType, User } = require('../models');

/**
 * Seed AI scoring criteria - Tạo tiêu chí chấm điểm AI cho các bài thi
 * Based on APTIS Technical Report with CEFR-aligned assessment scales
 */

// ========================================
// Helper function - Load references
// ========================================
async function loadReferences() {
  const adminUser = await User.findOne({ where: { email: 'admin@aptis.local' } });
  if (!adminUser) {
    throw new Error('Không tìm thấy tài khoản admin. Vui lòng chạy seed:users trước.');
  }

  const aptisGeneral = await AptisType.findOne({ where: { code: 'APTIS_GENERAL' } });
  
  const questionTypes = {};
  const codes = [
    'WRITING_SHORT', 'WRITING_FORM', 'WRITING_LONG', 'WRITING_EMAIL',
    'SPEAKING_INTRO', 'SPEAKING_DESCRIPTION', 'SPEAKING_COMPARISON', 'SPEAKING_DISCUSSION'
  ];
  
  for (const code of codes) {
    questionTypes[code] = await QuestionType.findOne({ where: { code } });
  }

  return { adminUser, aptisGeneral, questionTypes };
}

// ========================================
// Writing Criteria Builders
// ========================================
function buildWritingCriteria(adminId, aptisId, questionTypes) {
  return [
    // Task 1 - A1 Form Filling (0-4 scale)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_SHORT.id,
      criteria_name: 'Overall Impression',
      created_by: adminId,
      rubric_prompt: 'Evaluate overall effectiveness of A1-level form-filling response.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_SHORT.id,
      criteria_name: 'Task Completion',
      created_by: adminId,
      rubric_prompt: 'Assess if all required gaps are filled with appropriate A1-level vocabulary.',
    },

    // Task 2 - A2 Form Filling (0-5 scale, 20-30 words)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_FORM.id,
      criteria_name: 'Overall Impression',
      created_by: adminId,
      rubric_prompt: 'Evaluate overall effectiveness at A2 level with appropriate short sentences.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_FORM.id,
      criteria_name: 'Relevance of Content to Topic',
      created_by: adminId,
      rubric_prompt: 'Assess how well response addresses the question and maintains topic relevance.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_FORM.id,
      criteria_name: 'Task Completion',
      created_by: adminId,
      rubric_prompt: 'Evaluate if response meets 20-30 word count requirement and demonstrates A2-level completion.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_FORM.id,
      criteria_name: 'Grammar and Vocabulary',
      created_by: adminId,
      rubric_prompt: 'Assess basic grammatical accuracy and vocabulary usage for A2 level.',
    },

    // Task 3 - B1 Chat Responses (0-5 scale, 30-40 words each)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_LONG.id,
      criteria_name: 'Relevance of Content to Topic',
      created_by: adminId,
      rubric_prompt: 'Evaluate how well each response addresses the question and maintains topic relevance.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_LONG.id,
      criteria_name: 'Task Completion',
      created_by: adminId,
      rubric_prompt: 'Assess if all 3 responses provided with 30-40 words each and demonstrate B1-level completion.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_LONG.id,
      criteria_name: 'Grammatical Accuracy',
      created_by: adminId,
      rubric_prompt: 'Evaluate grammatical accuracy appropriate for B1 level across all responses.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_LONG.id,
      criteria_name: 'Vocabulary Accuracy',
      created_by: adminId,
      rubric_prompt: 'Assess vocabulary usage and accuracy for B1-level communication.',
    },

    // Task 4 - B2 Email Writing (0-6 scale, dual register)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_EMAIL.id,
      criteria_name: 'Task Achievement and Register Control',
      created_by: adminId,
      rubric_prompt: 'Evaluate how well both emails address requirements with appropriate register control between friend and authority figure.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_EMAIL.id,
      criteria_name: 'Coherence and Cohesion',
      created_by: adminId,
      rubric_prompt: 'Assess organization, logical flow, and use of linking devices in both emails.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_EMAIL.id,
      criteria_name: 'Lexical Resource',
      created_by: adminId,
      rubric_prompt: 'Evaluate vocabulary range, appropriacy for both registers, and accuracy.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.WRITING_EMAIL.id,
      criteria_name: 'Grammatical Range and Accuracy',
      created_by: adminId,
      rubric_prompt: 'Assess variety of structures and grammatical accuracy with 6-point scale distinction.',
    },
  ];
}

// ========================================
// Speaking Criteria Builders
// ========================================
function buildSpeakingCriteria(adminId, aptisId, questionTypes) {
  const b1SpeakingScale = `OFFICIAL APTIS SPEAKING SCALE for B1 Tasks (from Technical Report Appendix 1):

5 - Likely to be above B1 level.

4 (B1.2) - Responses on topic with: control of simple grammatical structures; sufficient vocabulary range; intelligible pronunciation; some pausing/reformulations; simple cohesive devices.

3 (B1.1) - At least two responses on topic with: control of simple grammatical structures; sufficient vocabulary range; intelligible pronunciation; some pausing/reformulations; simple cohesive devices.

2 (A2.2) - At least two responses on topic with: some simple grammatical structures; limited vocabulary; noticeable mispronunciations; noticeable pausing; limited cohesion.

1 (A2.1) - One response on topic with: basic grammatical structures with mistakes; limited vocabulary; noticeable mispronunciations; noticeable pausing; limited cohesion.

0 - Performance below A2.`;

  return [
    // Task 1 - A2 Personal Introduction (0-5 scale)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_INTRO.id,
      criteria_name: 'Overall Impression',
      created_by: adminId,
      rubric_prompt: 'Evaluate overall effectiveness and sustainability of A2-level performance. Focus on ability to maintain CEFR level throughout response.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_INTRO.id,
      criteria_name: 'Content and Task Completion',
      created_by: adminId,
      rubric_prompt: 'Assess relevant personal information appropriate for A2 level and coverage of required elements.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_INTRO.id,
      criteria_name: 'Fluency and Pronunciation',
      created_by: adminId,
      rubric_prompt: 'Assess speech flow and pronunciation for A2 level with consideration for minor hesitations.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_INTRO.id,
      criteria_name: 'Language Range and Control',
      created_by: adminId,
      rubric_prompt: 'Evaluate adequate range for A2+ with good control of basic structures. Note: Intonation is least important.',
    },

    // Task 2 - B1 Picture Description (0-5 scale)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_DESCRIPTION.id,
      criteria_name: 'APTIS B1 Speaking Scale (Tasks 2&3)',
      created_by: adminId,
      rubric_prompt: b1SpeakingScale,
    },

    // Task 3 - B1 Comparison (0-5 scale, same scale as Task 2)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_COMPARISON.id,
      criteria_name: 'APTIS B1 Speaking Scale (Tasks 2&3)',
      created_by: adminId,
      rubric_prompt: b1SpeakingScale,
    },

    // Task 4 - B2 Discussion (0-6 scale, allows C1/C2 extension)
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_DISCUSSION.id,
      criteria_name: 'Task Achievement and Sustainability',
      created_by: adminId,
      rubric_prompt: 'BAND 6: C2 performance. BAND 5: C1 performance. BAND 4: Strong B2 sustained. BAND 3: Typical B2 (TARGET). BAND 2: B1+. BAND 0-1: Below B1.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_DISCUSSION.id,
      criteria_name: 'Fluency and Coherence',
      created_by: adminId,
      rubric_prompt: 'BAND 6: Natural effortless delivery. BAND 5: Minor hesitations, coherent complex topics. BAND 4: Generally fluent with clear organization. BAND 3: Adequate for B1-2. BAND 0-2: Frequent issues.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_DISCUSSION.id,
      criteria_name: 'Lexical Resource',
      created_by: adminId,
      rubric_prompt: 'BAND 6: Sophisticated, precise vocabulary. BAND 5: Wide range, abstract concepts. BAND 4: Good discussion vocabulary. BAND 3: Adequate range for B2. BAND 0-2: Limited vocabulary.',
    },
    {
      aptis_type_id: aptisId,
      question_type_id: questionTypes.SPEAKING_DISCUSSION.id,
      criteria_name: 'Grammatical Range and Accuracy',
      created_by: adminId,
      rubric_prompt: 'BAND 6: Consistently accurate sophisticated structures. BAND 5: Good range, generally high accuracy. BAND 4: B2 structures with variety. BAND 3: Adequate range with reasonable accuracy. BAND 0-2: Limited range.',
    },
  ];
}

// ========================================
// Main seed function
// ========================================
async function seedAiCriteria() {
  try {
    console.log('[Seed] Seeding AI scoring criteria...');

    const { adminUser, aptisGeneral, questionTypes } = await loadReferences();

    // Build all criteria
    const writingCriteria = buildWritingCriteria(adminUser.id, aptisGeneral.id, questionTypes);
    const speakingCriteria = buildSpeakingCriteria(adminUser.id, aptisGeneral.id, questionTypes);
    const allCriteria = [...writingCriteria, ...speakingCriteria];

    // Seed to database
    for (const criterion of allCriteria) {
      await AiScoringCriteria.findOrCreate({
        where: {
          aptis_type_id: criterion.aptis_type_id,
          question_type_id: criterion.question_type_id,
          criteria_name: criterion.criteria_name,
        },
        defaults: criterion,
      });
    }

    console.log(`[Seed] ✓ Created ${allCriteria.length} AI scoring criteria`);
    console.log('[Seed] ✓ AI scoring criteria seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] ✗ Error seeding AI criteria:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedAiCriteria();
}

module.exports = seedAiCriteria;
