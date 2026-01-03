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
const VoiceRSSService = require('../services/VoiceRSSService');

/**
 * Seed APTIS questions theo cấu trúc thực tế (200 điểm tổng)
 * 
 * CẤU TRÚC ĐỀ THI APTIS:
 * - Reading: 20 câu (Part 1: 5 Gap Filling, Part 2: 5 Ordering, Part 3: 5 Matching, Part 4: 5 Matching Headings)
 * - Listening: 25 câu (4 parts)
 * - Writing: 4 tasks (AI scoring)
 * - Speaking: 4 tasks (AI scoring)
 */
async function seedQuestions() {
  try {
    console.log('[Seed] Seeding APTIS questions...');

    const aptisType = await AptisType.findOne({ where: { code: 'APTIS_GENERAL' } });
    const teacher = await User.findOne({ where: { email: 'teacher1@aptis.local' } });

    if (!aptisType || !teacher) {
      throw new Error('APTIS type or teacher not found');
    }

    // Seed questions for each skill
    await seedReadingQuestions(aptisType, teacher);
    await seedListeningQuestions(aptisType, teacher);
    await seedWritingQuestions(aptisType, teacher);
    await seedSpeakingQuestions(aptisType, teacher);

    console.log('[Seed] All questions seeded successfully');
  } catch (error) {
    console.error('[Seed] Failed to seed questions:', error);
    throw error;
  }
}

// ========================================
// GRAMMAR (REMOVED - Only 4 skills: Reading, Listening, Writing, Speaking)
// ========================================
async function seedGrammarQuestions(aptisType, teacher) {
  // Deprecated: Grammar & Vocabulary removed from APTIS structure
  console.log('[Seed] Skipping Grammar questions (removed from APTIS)');
}

// ========================================
// READING - 20 câu trong 4 parts
// Part 1: Gap Filling - 5 câu
// Part 2: Ordering - 5 câu
// Part 3: Matching - 5 items
// Part 4: Matching Headings - 5 items
// ========================================
async function seedReadingQuestions(aptisType, teacher) {
  console.log('[Seed] Seeding 25 Reading questions in 5 parts...');

  // Part 1: Gap Filling (5 câu) - Chọn từ từ danh sách để điền vào chỗ trống
  const readingGapFillType = await QuestionType.findOne({ where: { code: 'READING_GAP_FILL' } });
  
  const gapFillingQuestions = [
    {
      passage: 'Dear Sam,\n\nI hope you\'re doing [GAP1]! I wanted to tell you about my recent trip to the park. It was [GAP2] a lovely day to be outside. I thought it was [GAP3] hot to walk around for long. I met friends [GAP4] my birthday party, and we had a great time. We decided to grab [GAP5] snacks for our picnic. After you come, we will have [GAP6].',
      options: ['well', 'only', 'under', 'much', 'really', 'food'],
      correctAnswers: ['well', 'only', 'really', 'under', 'much', 'food'],
      prompt: 'Choose one word from the list for each gap. The first one is done for you.'
    },
    {
      passage: 'The museum is [GAP1] from 10 AM to 6 PM. Entrance [GAP2] is 15 dollars for adults. Children [GAP3] twelve get in for [GAP4]. [GAP5] you need directions, staff can help.',
      options: ['free', 'fee', 'under', 'If', 'open'],
      correctAnswers: ['open', 'fee', 'under', 'free', 'If'],
      prompt: 'Complete the text with appropriate words from the list.'
    },
    {
      passage: 'Learning English [GAP1] important for international communication. Many students [GAP2] difficulty with pronunciation. [GAP3] practice every day helps improve fluency. Online [GAP4] are very useful nowadays. Teachers recommend [GAP5] at least one hour daily.',
      options: ['resources', 'studying', 'Regular', 'is', 'have'],
      correctAnswers: ['is', 'have', 'Regular', 'resources', 'studying'],
      prompt: 'Fill in the gaps with words from the provided list.'
    },
    {
      passage: 'Technology has [GAP1] our lives significantly. Smart devices are [GAP2] in every household. The [GAP3] of artificial intelligence grows every year. However, we must [GAP4] about privacy and security. Education systems must [GAP5] students for the digital world.',
      options: ['concern', 'prepare', 'growth', 'common', 'changed'],
      correctAnswers: ['changed', 'common', 'growth', 'concern', 'prepare'],
      prompt: 'Select appropriate words to complete the sentences.'
    },
    {
      passage: 'Environmental [GAP1] is one of our biggest challenges. Climate [GAP2] affects weather patterns worldwide. Governments must [GAP3] action to reduce carbon emissions. Individuals can also [GAP4] by using renewable energy. Together, we can [GAP5] our planet for future generations.',
      options: ['protect', 'change', 'take', 'pollution', 'contribute'],
      correctAnswers: ['pollution', 'change', 'take', 'contribute', 'protect'],
      prompt: 'Complete the passage with words from the list.'
    }
  ];

  for (let i = 0; i < 5; i++) {
    const question = await Question.create({
      question_type_id: readingGapFillType.id,
      aptis_type_id: aptisType.id,
      difficulty: i < 2 ? 'easy' : i < 4 ? 'medium' : 'hard',
      content: `${gapFillingQuestions[i].prompt}\n\n${gapFillingQuestions[i].passage}`,
      created_by: teacher.id,
      status: 'active',
    });

    // Create option choices
    for (let j = 0; j < gapFillingQuestions[i].options.length; j++) {
      await QuestionOption.create({
        question_id: question.id,
        item_id: null,
        option_text: gapFillingQuestions[i].options[j],
        option_order: j + 1,
        is_correct: false,
      });
    }

    // Create gap items with correct answers (item_number for gap numbering)
    for (let j = 0; j < gapFillingQuestions[i].correctAnswers.length; j++) {
      await QuestionItem.create({
        question_id: question.id,
        item_text: `[GAP${j + 1}]`,
        item_number: j + 1,
        item_order: j + 1,
        answer_text: gapFillingQuestions[i].correctAnswers[j],
      });
    }
  }

  console.log(`[Seed]   - Part 1: 5 Gap Filling questions`);

  // Part 2: Ordering (5 câu) - Sắp xếp các câu theo thứ tự đúng
  const readingOrderingType = await QuestionType.findOne({ where: { code: 'READING_ORDERING' } });
  
  const orderingQuestions = [
    {
      title: 'Tom Harper (Biography Ordering)',
      passage: 'This is the short summary of Tom Harper life.',
      sentences: [
        'When he was young, he began writing short stories for a magazine.',
        'He soon wrote regularly for that magazine, sharing his creative ideas with many readers.',
        'At one point, he almost left his job, but then he decided to create unusual characters.',
        'The characters he imagined became some of the most famous in literature.',
        'This popularity made him rich and successful.'
      ],
      correctOrder: [1, 2, 3, 4, 5]
    },
    {
      title: 'Key Card Information (Instructions Ordering)',
      passage: 'The following is the instruction of how to use the key card.',
      sentences: [
        'To access the building and use the lift, you need to use the key card.',
        'He or she will ask your name and flat number and will write these down.',
        'You will also need to show him or her your identification card.',
        'He or she will take a copy of it and give you a new card.',
        'If you lose this, please see the staff member at the front desk.'
      ],
      correctOrder: [1, 2, 3, 4, 5]
    },
    {
      title: 'Recipe Steps (Process Ordering)',
      passage: 'Steps for making a simple pasta dish.',
      sentences: [
        'Boil water in a large pot and add salt.',
        'Add pasta to the boiling water and cook until tender.',
        'Drain the pasta and add it to a bowl.',
        'Pour your favorite sauce over the pasta.',
        'Mix well and serve hot with grated cheese.'
      ],
      correctOrder: [1, 2, 3, 4, 5]
    },
    {
      title: 'Historical Event (Chronological Ordering)',
      passage: 'Key events in the development of the internet.',
      sentences: [
        'The World Wide Web was invented in 1989 by Tim Berners-Lee.',
        'Early computer networks like ARPANET were created in the 1960s.',
        'Commercial internet service became available to the public in the 1990s.',
        'Personal computers became affordable for most households in the 1980s.',
        'Today, the internet is essential infrastructure in modern society.'
      ],
      correctOrder: [2, 4, 1, 3, 5]
    },
    {
      title: 'Problem Solving (Logical Ordering)',
      passage: 'Steps to solve a common technical problem.',
      sentences: [
        'First, check if your device is properly connected to power.',
        'If the problem persists, restart your device completely.',
        'Verify that all cables are securely connected.',
        'If it still doesn\'t work, consult the user manual or support.',
        'Turn it off and wait for 30 seconds before turning it back on.'
      ],
      correctOrder: [1, 3, 2, 5, 4]
    }
  ];

  for (let i = 0; i < 5; i++) {
    const question = await Question.create({
      question_type_id: readingOrderingType.id,
      aptis_type_id: aptisType.id,
      difficulty: i < 2 ? 'easy' : i < 4 ? 'medium' : 'hard',
      content: `${orderingQuestions[i].title}\n\n0. ${orderingQuestions[i].passage}\n\n${orderingQuestions[i].sentences.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n')}\n\nPut the sentences in the right order.`,
      created_by: teacher.id,
      status: 'active',
    });

    // Shuffle sentences để item_order không trùng với answer
    const shuffled = [...orderingQuestions[i].sentences]
      .map((s, idx) => ({ text: s, originalIdx: idx + 1 }))
      .sort(() => Math.random() - 0.5);

    // Create items with random display order, but correct answer order
    for (let j = 0; j < orderingQuestions[i].sentences.length; j++) {
      const correctPosition = orderingQuestions[i].correctOrder[shuffled[j].originalIdx - 1];
      
      await QuestionItem.create({
        question_id: question.id,
        item_text: `${shuffled[j].originalIdx}. ${shuffled[j].text}`,
        item_order: j + 1,  // Display order (random)
        answer_text: `${correctPosition}`,  // Correct position
      });
    }
  }

  console.log(`[Seed]   - Part 2: 5 Ordering questions`);

  // Part 3: Matching (5 câu) - Ghép người/câu hỏi với câu trả lời
  const readingMatchingType = await QuestionType.findOne({ where: { code: 'READING_MATCHING' } });
  
  const question3 = await Question.create({
    question_type_id: readingMatchingType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'medium',
    content: `Four people share their feelings about reading books. Read their answers and answer the questions below.

Person A: I have to read a lot for my job, and I find that reading factual books is often boring. The material tends to be dry and lacks excitement. After a long day at work, I usually feel too exhausted to read much, which means I have limited time for reading anything enjoyable.

Person B: My wife is always complaining that she can't read many books. I don't have that problem because I plan the reading schedule carefully. I set aside specific times each week for reading, which helps me stay on track. This way, I can enjoy my books while she finds it challenging to keep up.

Person C: When I was a child, I struggled to finish one book at a time. It felt overwhelming to stay focused on a single story. However, now that I'm older, I enjoy exploring many genres and even read multiple books at once. I have a long list of books I want to read in the future, which keeps me excited.

Person D: I keep a novel on the bedside table because I want to read before sleeping. However, I often find myself getting sleepy as soon as I start reading, which makes it difficult to concentrate. As a result, it has taken me several months to finish this book, and I still haven't completed it.

Match the following questions with the correct person:
- Who thinks reading factual books is boring? → Person _____
- Who reads more than another family member? → Person _____
- Who has limited time for reading? → Person _____
- Who has difficulty in finishing a book? → Person _____
- Who reads many books at once? → Person _____`,
    created_by: teacher.id,
    status: 'active',
  });

  const questions = [
    { text: 'Who thinks reading factual books is boring?', correct: 'A' },
    { text: 'Who reads more than another family member?', correct: 'B' },
    { text: 'Who has limited time for reading?', correct: 'A' },
    { text: 'Who has difficulty in finishing a book?', correct: 'D' },
    { text: 'Who reads many books at once?', correct: 'C' }
  ];

  // Create options once (question-level)
  const optionMap = {};
  const personOptions = ['Person A', 'Person B', 'Person C', 'Person D'];
  for (let k = 0; k < personOptions.length; k++) {
    const option = await QuestionOption.create({
      question_id: question3.id,
      item_id: null,
      option_text: personOptions[k],
      option_order: k + 1,
      is_correct: false,
    });
    optionMap[personOptions[k]] = option.id;
  }

  // Create items linked to correct options
  for (let j = 0; j < 5; j++) {
    const item = await QuestionItem.create({
      question_id: question3.id,
      item_text: questions[j].text,
      item_order: j + 1,
      answer_text: questions[j].correct,
    });

    // Update item with correct option reference
    const correctOptionText = `Person ${questions[j].correct}`;
    await item.update({ correct_option_id: optionMap[correctOptionText] });
  }

  console.log(`[Seed]   - Part 3: 5 Matching questions (Person-based)`);

  // Part 4: Matching Headings (5 câu) - Ghép tiêu đề với đoạn văn
  const readingHeadingsType = await QuestionType.findOne({ where: { code: 'READING_MATCHING_HEADINGS' } });
  
  const question4 = await Question.create({
    question_type_id: readingHeadingsType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'medium',
    content: `Read the passage quickly. Choose a heading for each numbered paragraph (1-5) from the drop-down box.

Vegetarian Food

Available Headings:
- Understanding the possible global food crisis and its causes
- Recipes for popular vegetarian dishes
- Diverse types of vegetarian meals
- The ethical and environmental implications of factory farming
- Numerous health benefits of plant-based diets
- Shared global responsibility towards sustainable eating
- Respect for life: embracing compassion for all living beings
- Various explanations behind dietary choices and preferences

PARAGRAPH 1:
No longer seeing food as simply protein from animals, there are innumerable options for those opting not to eat meat. From vibrant salads loaded with fresh vegetables to hearty plant-based entrees and numerous delicious desserts, the possibilities are endless. Creative approaches to vegetarian cooking, providing a satisfying array of nutritious dishes, showcase how one can enjoy plant-based meals.

PARAGRAPH 2:
Understanding the different reasons individuals are making them. Many people opt for a vegetarian diet for health considerations. Some may be motivated by cultural traditions or personal beliefs, while others seek new culinary experiences. Understanding these motivations fosters respectful discussions about food choices and their implications, promoting a more inclusive dialogue around dietary preferences.

PARAGRAPH 3:
As the global population continues to grow, concerns about food security and sustainability intensify. The increasing demand for resources puts immense pressure on agricultural systems, leading to potential shortages and rising prices. Without significant changes in our consumption patterns and food production methods, widespread shortages could threaten global food availability, necessitating immediate action including vegetarian options, which can alleviate some of the pressure on our food systems.

PARAGRAPH 4:
The industrial approach to livestock production raises numerous ethical and environmental questions. Large-scale operations often prioritize efficiency over animal welfare, resulting in cramped living conditions and the overuse of antibiotics. This practice not only impacts the lives of animals but contributes to pollution and greenhouse gas emissions. As awareness of these issues grows, many advocates push for more humane and sustainable farming practices, which align better with the ethical motivations of those choosing plant-based diets.

PARAGRAPH 5:
Plant-based diets have been extensively researched and shown to offer numerous health benefits. Studies demonstrate that vegetarian diets can lower the risk of chronic diseases including heart disease and type 2 diabetes. Plant-based nutrition provides essential nutrients and is low in unhealthy fats. Embracing a vegetarian diet supports not only personal health but also aligns with global environmental sustainability efforts.

PARAGRAPH 6:
In an interconnected world, our food consumption choices carry significant weight. Each individual's decisions can influence broader societal impacts, affecting everything from environmental sustainability to animal welfare. Embracing a sense of stewardship encourages us to consider how our eating habits impact not just our health, but also the health of the planet. By making conscious choices, such as incorporating more plant-based meals, we can collectively work towards a more equitable and sustainable future for all.

PARAGRAPH 7:
Of course, one cannot discuss the benefits of vegetarianism without understanding the broader implications for overall well-being. Research on plant-based dietary approaches demonstrates that these eating patterns can lower the risk of chronic diseases. Embracing plant-based nutrition provides essential nutrients and low in unhealthy fats. Enjoying plant-based foods in moderation, ensuring a compassionate world. This approach inspires actions that contribute to a more peaceful and sustainable planet, ultimately benefiting both individuals and society as a whole.`,
    created_by: teacher.id,
    status: 'active',
  });

  const paragraphs = [
    { num: 1, heading: 'Diverse types of vegetarian meals', correct: 3 },
    { num: 2, heading: 'Various explanations behind dietary choices and preferences', correct: 8 },
    { num: 3, heading: 'Understanding the possible global food crisis and its causes', correct: 1 },
    { num: 4, heading: 'The ethical and environmental implications of factory farming', correct: 4 },
    { num: 5, heading: 'Numerous health benefits of plant-based diets', correct: 5 }
  ];

  const headingOptions = [
    'Understanding the possible global food crisis and its causes',
    'Recipes for popular vegetarian dishes',
    'Diverse types of vegetarian meals',
    'The ethical and environmental implications of factory farming',
    'Numerous health benefits of plant-based diets',
    'Shared global responsibility towards sustainable eating',
    'Respect for life: embracing compassion for all living beings',
    'Various explanations behind dietary choices and preferences'
  ];

  // Create 8 heading options once (question-level, NOT per item)
  const headingOptionMap = {};
  for (let k = 0; k < headingOptions.length; k++) {
    const option = await QuestionOption.create({
      question_id: question4.id,
      item_id: null,
      option_text: headingOptions[k],
      option_order: k + 1,
      is_correct: false,
    });
    headingOptionMap[headingOptions[k]] = option.id;
  }

  // Create 5 items linked to correct heading options
  for (let j = 0; j < 5; j++) {
    const item = await QuestionItem.create({
      question_id: question4.id,
      item_text: `Paragraph ${paragraphs[j].num}`,
      item_order: j + 1,
      answer_text: paragraphs[j].heading,
    });

    // Update item with correct option reference
    await item.update({ correct_option_id: headingOptionMap[paragraphs[j].heading] });
  }

  console.log(`[Seed]   - Part 4: 5 Matching Headings questions (8 headings created once, not 40 times)`);
  console.log(`[Seed] ✓ 25 Reading questions created (5+5+5+5 Gap Fill + Ordering + Matching + Matching Headings = 100 điểm)`);
}

// ========================================
// LISTENING - 17 câu trong 4 parts (50 điểm tổng)
// Part 1: MCQ - 5 câu x 3 điểm = 15 điểm
// Part 2: Speaker Matching - 4 speakers x 3 điểm = 12 điểm
// Part 3: MCQ Multi-question - 2 shared audio (4 câu) x 3 điểm = 12 điểm
// Part 4: Statement Matching - 4 statements x 3 điểm = 12 điểm (Tổng 17 câu)
// ========================================
async function seedListeningQuestions(aptisType, teacher) {
  console.log('[Seed] Seeding 17 Listening questions in 4 parts...');

  // Part 1: MCQ (5 câu)
  const listeningMcqType = await QuestionType.findOne({ where: { code: 'LISTENING_MCQ' } });
  
  const part1Scripts = [
    'A man is calling his mother. How long will he be late?',
    'A woman is going to the cinema with her husband. What time does the movie begin?',
    'A teacher is talking to her students. Where are the students now?',
    'A man is sharing a new guidebook. Choose the correct answers.',
    'A reviewer discussing a book about the life of a scientist. Choose the correct answers.'
  ];

  const mcqOptions = [
    ['10 minutes', '15 minutes', '20 minutes'],
    ['6:40', '7:00', '9:20'],
    ['At school', 'In a townhouse', 'In a museum'],
    ['It focuses solely on historical landmarks', 'It creates an adventure', 'It is difficult to navigate'],
    ['It is focused on technical details', 'It is exciting to read', 'It is more of a textbook than a biography']
  ];

  for (let i = 0; i < 5; i++) {
    const question = await Question.create({
      question_type_id: listeningMcqType.id,
      aptis_type_id: aptisType.id,
      difficulty: i <= 1 ? 'easy' : i <= 2 ? 'medium' : 'hard',
      content: part1Scripts[i],
      media_url: '/uploads/audio/test.mp3',
      created_by: teacher.id,
      status: 'active',
    });

    for (let j = 0; j < 3; j++) {
      await QuestionOption.create({
        question_id: question.id,
        item_id: null,
        option_text: mcqOptions[i][j],
        option_order: j + 1,
        is_correct: j === (i === 0 ? 1 : i === 1 ? 0 : 0),
      });
    }
  }

  console.log(`[Seed]   - Part 1: 5 MCQ questions with audio`);

  // Part 2: Speaker Matching (4 speakers với các file audio riêng)
  const listeningMatchingType = await QuestionType.findOne({ where: { code: 'LISTENING_MATCHING' } });
  
  const question2 = await Question.create({
    question_type_id: listeningMatchingType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'medium',
    content: 'Listen to opinions of 4 people A B C D about when they like listening to music',
    media_url: '/uploads/audio/test.mp3', // Main instruction audio
    created_by: teacher.id,
    status: 'active',
  });

  const speakers = ['Speaker A', 'Speaker B', 'Speaker C', 'Speaker D'];
  const musicOptions = ['After waking up', 'While singing', 'To relax', 'While reading', 'While studying', 'While sleeping'];

  for (let i = 0; i < 4; i++) {
    const item = await QuestionItem.create({
      question_id: question2.id,
      item_text: speakers[i],
      item_order: i + 1,
      media_url: `/uploads/audio/speaker_${String.fromCharCode(65 + i)}.mp3`, // Individual audio for each speaker
    });
  }

  // Create options for all speakers
  for (let i = 0; i < musicOptions.length; i++) {
    await QuestionOption.create({
      question_id: question2.id,
      item_id: null,
      option_text: musicOptions[i],
      option_order: i + 1,
      is_correct: false,
    });
  }

  console.log(`[Seed]   - Part 2: 4 Speaker Matching with individual audio files`);

  // Part 3: Statement Matching (1 câu hỏi với 4 statements)
  const statementMatchingType = await QuestionType.findOne({ where: { code: 'LISTENING_STATEMENT_MATCHING' } });
  
  const question3 = await Question.create({
    question_type_id: statementMatchingType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'medium',
    content: 'Listen to two people discussing singers and music. Read the opinions below and decide whose opinion matches the statements, the man, the woman, or both the man and the woman.',
    media_url: '/uploads/audio/discussion.mp3',
    created_by: teacher.id,
    status: 'active',
  });

  const statements = [
    'Singer can be good models for the young.',
    'Taste in music is a highly personal thing.',
    'Music is a universal language.',
    'Music can be used to manipulate people\'s feelings.'
  ];

  for (let i = 0; i < 4; i++) {
    await QuestionItem.create({
      question_id: question3.id,
      item_text: statements[i],
      item_order: i + 1,
    });
  }

  // Create options for statement matching
  const statementOptions = ['Man', 'Woman', 'Both'];
  for (let i = 0; i < 3; i++) {
    await QuestionOption.create({
      question_id: question3.id,
      item_id: null,
      option_text: statementOptions[i],
      option_order: i + 1,
      is_correct: false,
    });
  }

  console.log(`[Seed]   - Part 3: 4 Statement Matching items`);

  // Part 4: MCQ Multi-question (2 shared audio files với 2 câu hỏi mỗi file)
  const multiQuestionScripts = [
    {
      audio: '/uploads/audio/guidebook.mp3',
      content: 'A man is sharing a new guidebook. Choose the correct answers.',
      questions: [
        'What does this guidebook offer to its audience?',
        'What is the speaker\'s opinion about this guidebook?'
      ],
      options: [
        ['It focuses solely on historical landmarks', 'It creates an adventure', 'It is difficult to navigate'],
        ['It caters only to seasoned travelers', 'It is outdated and irrelevant', 'It is suitable for particular generations']
      ]
    },
    {
      audio: '/uploads/audio/book_review.mp3',
      content: 'A reviewer discussing a book about the life of a scientist. Choose the correct answers.',
      questions: [
        'What does the speaker say about the way of writing?',
        'What does the speaker say about the overall content of the book?'
      ],
      options: [
        ['It is focused on technical details', 'It is exciting to read', 'It is more of a textbook than a biography'],
        ['It has been written for a general audience', 'It is only suitable for experts in the field', 'It lacks engaging storytelling']
      ]
    }
  ];

  for (let i = 0; i < 2; i++) {
    const question = await Question.create({
      question_type_id: listeningMcqType.id,
      aptis_type_id: aptisType.id,
      difficulty: 'hard',
      content: multiQuestionScripts[i].content,
      media_url: multiQuestionScripts[i].audio,
      additional_media: JSON.stringify([
        { type: 'audio', description: 'Question 1', url: multiQuestionScripts[i].audio },
        { type: 'audio', description: 'Question 2', url: multiQuestionScripts[i].audio }
      ]),
      created_by: teacher.id,
      status: 'active',
    });

    // Create 2 question items for each audio
    for (let j = 0; j < 2; j++) {
      await QuestionItem.create({
        question_id: question.id,
        item_text: multiQuestionScripts[i].questions[j],
        item_order: j + 1,
      });

      // Create options for each sub-question  
      for (let k = 0; k < 3; k++) {
        await QuestionOption.create({
          question_id: question.id,
          item_id: null,
          option_text: multiQuestionScripts[i].options[j][k],
          option_order: (j * 3) + k + 1,
          is_correct: k === (j === 0 ? 1 : j === 1 ? 0 : 1), // Set correct answers
        });
      }
    }
  }

  console.log(`[Seed]   - Part 4: 2 Multi-question MCQ (4 total sub-questions)`);
  console.log(`[Seed] ✓ 17 Listening questions created (5+4+4+4 = 50 điểm)`);
}

// ========================================
// WRITING - 4 tasks (50 điểm tổng, AI scoring)
// Task 1: Short (12.5 điểm)
// Task 2: Email (12.5 điểm)
// Task 3: Long (12.5 điểm)
// Task 4: Essay (12.5 điểm)
// ========================================
async function seedWritingQuestions(aptisType, teacher) {
  console.log('[Seed] Seeding 4 Writing tasks...');

  const writingShortType = await QuestionType.findOne({ where: { code: 'WRITING_SHORT' } });
  const writingFormType = await QuestionType.findOne({ where: { code: 'WRITING_FORM' } });
  const writingLongType = await QuestionType.findOne({ where: { code: 'WRITING_LONG' } });
  const writingEmailType = await QuestionType.findOne({ where: { code: 'WRITING_EMAIL' } });

  // Part 1: Short Answers (1-5 words each)
  const part1 = await Question.create({
    question_type_id: writingShortType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'easy',
    content: JSON.stringify({
      title: "Book Club Membership",
      description: "You want to join a Book club. You have 5 messages from a member of the club. Write short answers (1-5 words) to each message.",
      messages: [
        "Which sport is the most popular in your country?",
        "What do you like doing with your friend?", 
        "Which sport do you like to play the most?",
        "Where do you usually go at weekends?",
        "How often do you play sport with friends?"
      ]
    }),
    created_by: teacher.id,
    status: 'active',
  });

  await QuestionSampleAnswer.create({
    question_id: part1.id,
    answer_text: JSON.stringify({
      "0": "Football",
      "1": "Watch movies together",
      "2": "Basketball",
      "3": "Shopping mall",
      "4": "Every weekend"
    }),
    score: 12.5,
    comment: 'Perfect short answers within word limit.',
  });

  // Part 2: Form Filling (20-30 words)
  const part2 = await Question.create({
    question_type_id: writingFormType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'easy',
    content: JSON.stringify({
      title: "Book Club Application Form",
      description: "You want to join a book club. Fill in the form. Write in sentences. Use 20-30 words.",
      question: "When and where do you usually read books?",
      placeholder: "Please describe your reading habits in complete sentences."
    }),
    created_by: teacher.id,
    status: 'active',
  });

  await QuestionSampleAnswer.create({
    question_id: part2.id,
    answer_text: 'I usually read books in the evening at home after dinner. I like to sit in my comfortable chair in the living room with a cup of tea.',
    score: 12.5,
    comment: 'Good sentence structure and appropriate length.',
  });

  // Part 3: Chat Responses (30-40 words each)
  const part3 = await Question.create({
    question_type_id: writingLongType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'medium',
    content: JSON.stringify({
      title: "Book Club Chat Room",
      description: "You are talking to other members of the club in the chat room. Talk to them using sentences. Use 30-40 words per answer.",
      messages: [
        {
          person: "Person A",
          message: "Tell me about your favourite time and place to read a book?"
        },
        {
          person: "Person B", 
          message: "I bought a book as a gift for my friend but I don't know what kind of book he likes. Can you give me some advice?"
        }
      ]
    }),
    created_by: teacher.id,
    status: 'active',
  });

  await QuestionSampleAnswer.create({
    question_id: part3.id,
    answer_text: JSON.stringify({
      "personA": "My favourite time to read is in the evening after work. I love sitting in my garden with a good book and a cup of coffee. The quiet atmosphere helps me focus and relax completely.",
      "personB": "I suggest asking your friend about their hobbies and interests first. Maybe choose a popular thriller or mystery novel as most people enjoy them. You could also check what books are currently bestsellers."
    }),
    score: 12.5,
    comment: 'Good conversational responses within word limits.',
  });

  // Part 4: Email Writing (50 words + 120-150 words)
  const part4 = await Question.create({
    question_type_id: writingEmailType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'hard',
    content: JSON.stringify({
      title: "Book Club Author Event",
      description: "You are a member of the book club. You received this email from the club's manager.",
      managerEmail: {
        subject: "Author Event Planning",
        body: "Dear member,\n\nOur club wants to organize an event for the public by inviting a famous author as a speaker. What kind of author do you suggest? What topic should the speaker speak on?\n\nI am writing to ask all members for their suggestions. Please send me your ideas in an email.\n\nThe manager."
      },
      tasks: [
        {
          type: "friend",
          description: "Write an email to your friend, who is also a member of the group. (50 words)",
          wordLimit: 50
        },
        {
          type: "manager", 
          description: "Write an email to the manager of the club. Tell the manager about your opinion. (120-150 words)",
          wordLimit: {min: 120, max: 150}
        }
      ]
    }),
    created_by: teacher.id,
    status: 'active',
  });

  await QuestionSampleAnswer.create({
    question_id: part4.id,
    answer_text: JSON.stringify({
      "friendEmail": "Hi Alex! Did you see the manager's email about the author event? I think we should suggest a mystery writer like Agatha Christie style. What do you think? Let me know your ideas!",
      "managerEmail": "Dear Manager,\n\nThank you for your email about organizing an author event for the public.\n\nI would like to suggest inviting a mystery or thriller novelist as the speaker. These genres are very popular and attract a wide audience. The topic should be about creative writing techniques and how to develop compelling characters.\n\nI believe this would attract many people and benefit our club by gaining new members who are interested in writing and reading mysteries. A practical workshop on plot development would be engaging.\n\nI look forward to hearing your thoughts.\n\nBest regards,\n[Student Name]"
    }),
    score: 12.5,
    comment: 'Both emails well-structured with appropriate tone and word counts.',
  });

  console.log(`[Seed] ✓ 4 Writing tasks created (4 x 12.5 = 50 điểm)`);
}

// ========================================
// SPEAKING - 4 tasks (50 điểm tổng, AI scoring)
// Task 1: Personal (12.5 điểm)
// Task 2: Compare (12.5 điểm)
// Task 3: Picture (12.5 điểm)
// Task 4: Discussion (12.5 điểm)
// ========================================
async function seedSpeakingQuestions(aptisType, teacher) {
  console.log('[Seed] Seeding 4 Speaking tasks...');

  const speakingPersonalType = await QuestionType.findOne({ where: { code: 'SPEAKING_INTRO' } });
  const speakingCompareType = await QuestionType.findOne({ where: { code: 'SPEAKING_COMPARISON' } });
  const speakingPictureType = await QuestionType.findOne({ where: { code: 'SPEAKING_DESCRIPTION' } });
  const speakingDiscussionType = await QuestionType.findOne({ where: { code: 'SPEAKING_DISCUSSION' } });

  // Task 1: Personal information (30s prep + 1 min speak)
  await Question.create({
    question_type_id: speakingPersonalType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'easy',
    content: 'Tell me about yourself:\n- Name and where you\'re from\n- Work or studies\n- Hobbies and interests\n\n30 seconds to prepare, 1 minute to speak.',
    duration_seconds: 90,
    created_by: teacher.id,
    status: 'active',
  });

  // Task 2: Describe and compare (1 min prep + 1.5 min speak)
  await Question.create({
    question_type_id: speakingCompareType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'medium',
    content: 'Look at two pictures (traveling by car vs train).\n\nCompare them:\n- Differences\n- Which you prefer and why\n\n1 minute to prepare, 1.5 minutes to speak.',
    media_url: '/images/speaking_task2.jpg',
    duration_seconds: 150,
    created_by: teacher.id,
    status: 'active',
  });

  // Task 3: Describe picture (1 min prep + 2 min speak)
  await Question.create({
    question_type_id: speakingPictureType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'medium',
    content: 'Look at a busy city street picture.\n\nDescribe:\n- People and their activities\n- Buildings and environment\n- Overall atmosphere\n\n1 minute to prepare, 2 minutes to speak.',
    media_url: '/images/speaking_task3.jpg',
    duration_seconds: 180,
    created_by: teacher.id,
    status: 'active',
  });

  // Task 4: Discussion (1 min prep + 2 min speak)
  await Question.create({
    question_type_id: speakingDiscussionType.id,
    aptis_type_id: aptisType.id,
    difficulty: 'hard',
    content: 'Topic: Technology in education\n\nDiscuss:\n- How has technology changed learning?\n- Advantages and disadvantages of online learning\n- Future of education\n\n1 minute to prepare, 2 minutes to speak.',
    duration_seconds: 180,
    created_by: teacher.id,
    status: 'active',
  });

  console.log(`[Seed] ✓ 4 Speaking tasks created (4 x 12.5 = 50 điểm)`);
}

// Run if called directly
if (require.main === module) {
  seedQuestions();
}

module.exports = seedQuestions;
