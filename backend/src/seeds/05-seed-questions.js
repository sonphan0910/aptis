require('dotenv').config();
const {
  Question,
  QuestionItem,
  QuestionOption,
  QuestionSampleAnswer,
  QuestionType,
  AptisType,
  User,
} = require('../models');

/**
 * Seed sample questions for all question types
 */
async function seedQuestions() {
  try {
    console.log('[Seed] Seeding sample questions...');

    // Get references
    const aptisGeneral = await AptisType.findOne({ where: { code: 'APTIS_GENERAL' } });
    const teacher = await User.findOne({ where: { role: 'teacher' } });

    if (!aptisGeneral || !teacher) {
      throw new Error('Required APTIS type or teacher user not found');
    }

    // Get all question types
    const questionTypes = await QuestionType.findAll();

    for (const qType of questionTypes) {
      const code = qType.code;

      if (code.includes('MCQ') || code.includes('mcq')) {
        await seedMCQQuestion(qType, aptisGeneral, teacher);
      } else if (code.includes('GAP_FILL') || code.includes('gap')) {
        await seedGapFillQuestion(qType, aptisGeneral, teacher);
      } else if (code.includes('MATCHING') || code.includes('matching')) {
        await seedMatchingQuestion(qType, aptisGeneral, teacher);
      } else if (code.includes('WRITING') || code.includes('writing')) {
        await seedWritingQuestion(qType, aptisGeneral, teacher);
      } else if (code.includes('SPEAKING') || code.includes('speaking')) {
        await seedSpeakingQuestion(qType, aptisGeneral, teacher);
      }
    }

    console.log('[Seed] Sample questions seeded successfully');
  } catch (error) {
    console.error('[Seed] Failed to seed questions:', error);
    throw error;
  }
}

/**
 * Seed MCQ question
 */
async function seedMCQQuestion(questionType, aptisType, teacher) {
  const [question] = await Question.findOrCreate({
    where: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      content: `Sample ${questionType.question_type_name} Question`,
    },
    defaults: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      difficulty: 'medium',
      content:
        'Choose the correct answer to complete the sentence:\n\nShe _____ to work every day.',
      created_by: teacher.id,
      status: 'active',
    },
  });

  // Create options
  const options = [
    { text: 'go', correct: false, order: 1 },
    { text: 'goes', correct: true, order: 2 },
    { text: 'going', correct: false, order: 3 },
    { text: 'went', correct: false, order: 4 },
  ];

  for (const opt of options) {
    await QuestionOption.findOrCreate({
      where: {
        question_id: question.id,
        option_text: opt.text,
      },
      defaults: {
        question_id: question.id,
        option_text: opt.text,
        option_order: opt.order,
        is_correct: opt.correct,
      },
    });
  }
}

/**
 * Seed Gap Fill question
 */
async function seedGapFillQuestion(questionType, aptisType, teacher) {
  const [question] = await Question.findOrCreate({
    where: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      content: `Sample ${questionType.question_type_name} Question`,
    },
    defaults: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      difficulty: 'medium',
      content:
        'Fill in the blanks with the correct words:\n\nThe weather _____ very nice today. I think we _____ go for a walk in the park.',
      created_by: teacher.id,
      status: 'active',
    },
  });

  // Create items (gaps)
  const items = [
    { text: 'The weather _____ very nice today.', order: 1, answer: 'is' },
    { text: 'I think we _____ go for a walk.', order: 2, answer: 'should' },
  ];

  for (const item of items) {
    await QuestionItem.findOrCreate({
      where: {
        question_id: question.id,
        item_order: item.order,
      },
      defaults: {
        question_id: question.id,
        item_text: item.text,
        item_order: item.order,
        answer_text: item.answer,
      },
    });
  }
}

/**
 * Seed Matching question
 */
async function seedMatchingQuestion(questionType, aptisType, teacher) {
  const [question] = await Question.findOrCreate({
    where: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      content: `Sample ${questionType.question_type_name} Question`,
    },
    defaults: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      difficulty: 'medium',
      content: 'Match the words with their definitions:',
      created_by: teacher.id,
      status: 'active',
    },
  });

  // Create items (words to match)
  const items = [
    { text: 'Happy', order: 1 },
    { text: 'Sad', order: 2 },
    { text: 'Angry', order: 3 },
  ];

  const createdItems = [];
  for (const item of items) {
    const [createdItem] = await QuestionItem.findOrCreate({
      where: {
        question_id: question.id,
        item_order: item.order,
      },
      defaults: {
        question_id: question.id,
        item_text: item.text,
        item_order: item.order,
      },
    });
    createdItems.push(createdItem);
  }

  // Create options (definitions)
  const options = [
    { text: 'Feeling joyful and pleased', order: 1, correctFor: 0 },
    { text: 'Feeling unhappy or sorrowful', order: 2, correctFor: 1 },
    { text: 'Feeling mad or furious', order: 3, correctFor: 2 },
  ];

  for (const opt of options) {
    const [option] = await QuestionOption.findOrCreate({
      where: {
        question_id: question.id,
        option_text: opt.text,
      },
      defaults: {
        question_id: question.id,
        option_text: opt.text,
        option_order: opt.order,
      },
    });

    // Update the corresponding item with correct option
    if (createdItems[opt.correctFor]) {
      await createdItems[opt.correctFor].update({
        correct_option_id: option.id,
      });
    }
  }
}

/**
 * Seed Writing question
 */
async function seedWritingQuestion(questionType, aptisType, teacher) {
  const [question] = await Question.findOrCreate({
    where: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      content: `Sample ${questionType.question_type_name} Question`,
    },
    defaults: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      difficulty: 'medium',
      content: questionType.code.includes('SHORT')
        ? 'Write a short paragraph (50-100 words) about your favorite hobby. Explain why you enjoy it and when you do it.'
        : 'Write an essay (150-200 words) discussing the advantages and disadvantages of social media. Give your opinion with examples.',
      duration_seconds: questionType.code.includes('SHORT') ? 900 : 1800, // 15 or 30 minutes
      created_by: teacher.id,
      status: 'active',
    },
  });

  // Create sample answer
  await QuestionSampleAnswer.findOrCreate({
    where: { question_id: question.id },
    defaults: {
      question_id: question.id,
      sample_answer: questionType.code.includes('SHORT')
        ? 'My favorite hobby is reading books. I enjoy reading because it helps me relax and learn new things. I usually read in the evening before going to bed. Reading allows me to explore different worlds and gain knowledge. It also improves my vocabulary and imagination.'
        : 'Social media has both advantages and disadvantages. On the positive side, it helps people connect with friends and family around the world. It also provides access to news and educational content. However, social media can be addictive and may lead to privacy issues. It can also spread false information quickly. In my opinion, social media is useful when used responsibly, but we should be careful about what we share and believe online.',
      min_words: questionType.code.includes('SHORT') ? 50 : 150,
      max_words: questionType.code.includes('SHORT') ? 100 : 200,
      answer_key_points: JSON.stringify(
        questionType.code.includes('SHORT')
          ? ['Hobby identification', 'Reason for enjoyment', 'When practiced', 'Benefits mentioned']
          : ['Advantages mentioned', 'Disadvantages mentioned', 'Personal opinion', 'Examples provided'],
      ),
    },
  });
}

/**
 * Seed Speaking question
 */
async function seedSpeakingQuestion(questionType, aptisType, teacher) {
  const [question] = await Question.findOrCreate({
    where: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      content: `Sample ${questionType.question_type_name} Question`,
    },
    defaults: {
      question_type_id: questionType.id,
      aptis_type_id: aptisType.id,
      difficulty: 'medium',
      content: getSpeakingQuestionContent(questionType.code),
      duration_seconds: getSpeakingDuration(questionType.code),
      created_by: teacher.id,
      status: 'active',
    },
  });

  // Create sample answer
  await QuestionSampleAnswer.findOrCreate({
    where: { question_id: question.id },
    defaults: {
      question_id: question.id,
      sample_answer: getSpeakingSampleAnswer(questionType.code),
      min_duration_seconds: getSpeakingDuration(questionType.code) - 30,
      max_duration_seconds: getSpeakingDuration(questionType.code),
      answer_key_points: getSpeakingKeyPoints(questionType.code),
    },
  });
}

function getSpeakingQuestionContent(code) {
  if (code.includes('INTRO')) {
    return 'Please introduce yourself. Tell me your name, where you are from, what you do, and what you like to do in your free time. You have 1 minute to speak.';
  } else if (code.includes('DESCRIPTION')) {
    return 'Look at this picture and describe what you see. Talk about the people, objects, colors, and activities. You have 2 minutes to speak.';
  } else if (code.includes('COMPARISON')) {
    return 'Compare and contrast living in a city versus living in the countryside. Discuss the advantages and disadvantages of each. You have 2 minutes to speak.';
  } else if (code.includes('DISCUSSION')) {
    return 'What do you think about online learning? Discuss its benefits and challenges. Give your personal opinion and examples. You have 2 minutes to speak.';
  }
  return 'Speak about the given topic for the allocated time.';
}

function getSpeakingDuration(code) {
  if (code.includes('INTRO')) {
    return 60;
  } // 1 minute
  return 120; // 2 minutes for others
}

function getSpeakingSampleAnswer(code) {
  if (code.includes('INTRO')) {
    return "Hello, my name is John Smith. I'm from New York, and I work as a software engineer at a technology company. In my free time, I enjoy reading books, playing basketball with friends, and traveling to new places. I also like cooking and trying different cuisines.";
  } else if (code.includes('DESCRIPTION')) {
    return "In this picture, I can see a beautiful park on a sunny day. There are several people enjoying outdoor activities. In the foreground, there's a family having a picnic on a red blanket. The children are playing with a ball while their parents are sitting and talking. The trees are green and full of leaves, and there are colorful flowers in the background.";
  }
  return 'This is a sample speaking response that demonstrates appropriate content, fluency, and language use for the given question type.';
}

function getSpeakingKeyPoints(code) {
  if (code.includes('INTRO')) {
    return JSON.stringify(['Name mentioned', 'Origin stated', 'Occupation described', 'Hobbies/interests listed']);
  } else if (code.includes('DESCRIPTION')) {
    return JSON.stringify([
      'Setting described',
      'People identified',
      'Activities mentioned',
      'Colors/details noted',
    ]);
  } else if (code.includes('COMPARISON')) {
    return JSON.stringify([
      'City advantages',
      'Countryside advantages',
      'City disadvantages',
      'Countryside disadvantages',
    ]);
  }
  return JSON.stringify([
    'Main points covered',
    'Examples provided',
    'Personal opinion expressed',
    'Clear structure',
  ]);
}

// Run if called directly
if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('[Seed] Questions seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Seed] Failed to seed questions:', error);
      process.exit(1);
    });
}

module.exports = seedQuestions;
