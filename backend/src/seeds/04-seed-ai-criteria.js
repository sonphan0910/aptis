require('dotenv').config();
const { AiScoringCriteria, AptisType, QuestionType, SkillType, User } = require('../models');

/**
 * Seed AI scoring criteria
 */
async function seedAiCriteria() {
  try {
    console.log('[Seed] Seeding AI scoring criteria...');

    // Get admin user for created_by
    const adminUser = await User.findOne({ where: { email: 'admin@aptis.local' } });
    if (!adminUser) {
      throw new Error('Admin user not found. Please run seed:users first.');
    }

    // Get IDs
    const aptisGeneral = await AptisType.findOne({ where: { code: 'APTIS_GENERAL' } });
    const writing = await SkillType.findOne({ where: { code: 'WRITING' } });
    const speaking = await SkillType.findOne({ where: { code: 'SPEAKING' } });

    const writingShort = await QuestionType.findOne({ where: { code: 'WRITING_SHORT' } });
    const writingLong = await QuestionType.findOne({ where: { code: 'WRITING_LONG' } });
    const writingEmail = await QuestionType.findOne({ where: { code: 'WRITING_EMAIL' } });
    const writingEssay = await QuestionType.findOne({ where: { code: 'WRITING_ESSAY' } });
    const speakingIntro = await QuestionType.findOne({ where: { code: 'SPEAKING_INTRO' } });
    const speakingDescription = await QuestionType.findOne({
      where: { code: 'SPEAKING_DESCRIPTION' },
    });
    const speakingComparison = await QuestionType.findOne({
      where: { code: 'SPEAKING_COMPARISON' },
    });
    const speakingDiscussion = await QuestionType.findOne({
      where: { code: 'SPEAKING_DISCUSSION' },
    });

    const criteria = [
      // Writing Short criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingShort.id,
        criteria_name: 'Content Relevance',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate how well the response addresses the given prompt. Check if main points are covered and relevant to the topic.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingShort.id,
        criteria_name: 'Grammar and Vocabulary',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Assess grammatical accuracy and vocabulary usage. Check for sentence structure, verb tenses, and appropriate word choices.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingShort.id,
        criteria_name: 'Organization',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate the logical flow and coherence of ideas. Check if the response has clear structure.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingShort.id,
        criteria_name: 'Word Count',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Check if the response meets the minimum word requirement (50-100 words) and stays within limits.',
      },

      // Writing Long criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingLong.id,
        criteria_name: 'Task Achievement',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate how completely the response addresses all parts of the task and presents a clear position.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingLong.id,
        criteria_name: 'Coherence and Cohesion',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Assess paragraph organization, logical progression, and use of linking words.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingLong.id,
        criteria_name: 'Lexical Resource',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Evaluate vocabulary range, appropriacy, and accuracy of word choices.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingLong.id,
        criteria_name: 'Grammatical Range and Accuracy',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Assess variety of sentence structures and grammatical accuracy.',
      },

      // Speaking Intro criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingIntro.id,
        criteria_name: 'Fluency',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate speech flow, pauses, hesitations, and overall smoothness of delivery.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingIntro.id,
        criteria_name: 'Pronunciation',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Assess clarity of pronunciation, stress, and intonation patterns.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingIntro.id,
        criteria_name: 'Grammar and Vocabulary',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Evaluate grammatical accuracy and vocabulary usage in spoken response.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingIntro.id,
        criteria_name: 'Content',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Check if the introduction provides relevant personal information.',
      },

      // Speaking Description criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDescription.id,
        criteria_name: 'Descriptive Language',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate use of descriptive vocabulary and ability to paint a clear picture.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDescription.id,
        criteria_name: 'Detail and Accuracy',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Assess the level of detail provided and accuracy of descriptions.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDescription.id,
        criteria_name: 'Fluency and Coherence',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Evaluate speech flow and logical organization of description.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDescription.id,
        criteria_name: 'Pronunciation',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Assess clarity and naturalness of pronunciation.',
      },

      // Writing Email criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEmail.id,
        criteria_name: 'Task Achievement',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate how well the email addresses all required elements: purpose, key points, and tone appropriateness.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEmail.id,
        criteria_name: 'Coherence and Cohesion',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Assess paragraph organization, logical progression, and use of linking words in the email.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEmail.id,
        criteria_name: 'Lexical Resource',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate vocabulary range, appropriacy, and accuracy of word choices for email writing.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEmail.id,
        criteria_name: 'Grammatical Range and Accuracy',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Assess variety of sentence structures and grammatical accuracy in the email.',
      },

      // Writing Essay criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEssay.id,
        criteria_name: 'Task Achievement',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate how completely the essay addresses all parts of the task and presents a clear position/argument.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEssay.id,
        criteria_name: 'Coherence and Cohesion',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Assess paragraph organization, essay structure, logical progression, and use of linking words.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEssay.id,
        criteria_name: 'Lexical Resource',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Evaluate vocabulary range, appropriacy, accuracy, and academic tone.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: writingEssay.id,
        criteria_name: 'Grammatical Range and Accuracy',
        weight: 0.25,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Assess variety of sentence structures, complex constructions, and grammatical accuracy.',
      },

      // Speaking Comparison criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingComparison.id,
        criteria_name: 'Task Achievement',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate how well the speaker identifies similarities and differences between items/topics.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingComparison.id,
        criteria_name: 'Fluency and Coherence',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Assess speech flow, coherence of ideas, and logical organization of the comparison.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingComparison.id,
        criteria_name: 'Lexical Resource',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate vocabulary range and use of comparison language (similar, different, while, whereas, etc.).',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingComparison.id,
        criteria_name: 'Pronunciation',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Assess clarity and naturalness of pronunciation throughout the comparison.',
      },

      // Speaking Discussion criteria
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDiscussion.id,
        criteria_name: 'Task Achievement',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate how well the speaker expresses opinions, provides reasons, and engages with the topic.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDiscussion.id,
        criteria_name: 'Fluency and Coherence',
        weight: 0.3,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Assess speech flow, logical development of ideas, and coherence of arguments.',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDiscussion.id,
        criteria_name: 'Lexical Resource',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt:
          'Evaluate vocabulary range and use of discussion language (I think, in my opinion, on the other hand, etc.).',
      },
      {
        aptis_type_id: aptisGeneral.id,
        question_type_id: speakingDiscussion.id,
        criteria_name: 'Grammatical Range and Accuracy',
        weight: 0.2,
        max_score: 10,
        created_by: adminUser.id,
        rubric_prompt: 'Assess grammatical accuracy and variety in spoken expression.',
      },
    ];

    for (const criterion of criteria) {
      await AiScoringCriteria.findOrCreate({
        where: {
          aptis_type_id: criterion.aptis_type_id,
          question_type_id: criterion.question_type_id,
          criteria_name: criterion.criteria_name,
        },
        defaults: criterion,
      });
    }

    console.log(`[Seed] ${criteria.length} AI criteria seeded`);
    console.log('[Seed] AI criteria seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Failed to seed AI criteria:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedAiCriteria();
}

module.exports = seedAiCriteria;
