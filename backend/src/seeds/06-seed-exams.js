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
 * Seed APTIS exams theo cấu trúc thực tế (200 điểm tổng)
 * 
 * CẤU TRÚC ĐỀ THI:
 * - Reading: 100 điểm (5 câu: 1 Gap Filling, 2 Ordering, 1 Matching, 1 Matching Headings)
 * - Listening: 50 điểm (17 câu: 5 MCQ, 4 Speaker Matching, 4 Statement Matching, 4 Multi-question MCQ)
 * - Writing: 50 điểm (4 tasks x 12.5 điểm, AI scoring)
 * - Speaking: 50 điểm (4 tasks x 12.5 điểm, AI scoring)
 * TỔNG: 200 điểm (4 skills only, no Grammar/Vocabulary)
 */
async function seedExams() {
  try {
    console.log('[Seed] Seeding APTIS exams...');

    const aptisType = await AptisType.findOne({ where: { code: 'APTIS_GENERAL' } });
    const teacher = await User.findOne({ where: { email: 'teacher1@aptis.local' } });

    if (!aptisType || !teacher) {
      throw new Error('APTIS type or teacher not found');
    }

    // Get skills (only 4: Reading, Listening, Writing, Speaking)
    const readingSkill = await SkillType.findOne({ where: { code: 'READING' } });
    const listeningSkill = await SkillType.findOne({ where: { code: 'LISTENING' } });
    const writingSkill = await SkillType.findOne({ where: { code: 'WRITING' } });
    const speakingSkill = await SkillType.findOne({ where: { code: 'SPEAKING' } });

    if (!readingSkill || !listeningSkill || !writingSkill || !speakingSkill) {
      throw new Error('Skills not found');
    }

    // Create Full APTIS Exam
    await createFullExam(aptisType, teacher, {
      readingSkill,
      listeningSkill,
      writingSkill,
      speakingSkill,
    });

    console.log('[Seed] ✓ APTIS exams seeded successfully');
  } catch (error) {
    console.error('[Seed] Failed to seed exams:', error);
    throw error;
  }
}

/**
 * Create full APTIS exam (200 điểm - 4 skills only)
 */
async function createFullExam(aptisType, teacher, skills) {
  console.log('[Seed] Creating Full APTIS General Exam...');

  const exam = await Exam.create({
    aptis_type_id: aptisType.id,
    title: 'APTIS General - Full Exam',
    description: 'Complete APTIS General exam testing all 4 skills: Reading, Listening, Writing, Speaking',
    duration_minutes: 180, // 3 hours total
    total_score: 200,
    created_by: teacher.id,
    status: 'published',
    published_at: new Date(),
  });

  let sectionOrder = 1;

  // Section 1: Reading (100 điểm - 20 câu)
  await createReadingSection(exam.id, skills.readingSkill, sectionOrder++);

  // Section 2: Listening (50 điểm)
  await createListeningSection(exam.id, skills.listeningSkill, sectionOrder++);

  // Section 3-6: Writing (50 điểm) - 4 separate sections
  await createWritingSection(exam.id, skills.writingSkill, sectionOrder++, 'WRITING_SHORT', 'Part 1: Short Answers', 3);
  await createWritingSection(exam.id, skills.writingSkill, sectionOrder++, 'WRITING_FORM', 'Part 2: Form Filling', 7);  
  await createWritingSection(exam.id, skills.writingSkill, sectionOrder++, 'WRITING_LONG', 'Part 3: Chat Responses', 10);
  await createWritingSection(exam.id, skills.writingSkill, sectionOrder++, 'WRITING_EMAIL', 'Part 4: Email Writing', 30);

  // Section 7: Speaking (50 điểm)
  await createSpeakingSection(exam.id, skills.speakingSkill, sectionOrder++);

  console.log(`[Seed] ✓ Full exam created with 7 sections (Reading + Listening + 4 Writing Parts + Speaking = 200 điểm tổng)`);
}

// ========================================
// READING SECTION - 100 điểm (5 câu)
// Part 1: 1 Gap Filling = 20 điểm
// Part 2: 2 Ordering x 20 = 40 điểm
// Part 3: 1 Matching (Person) = 20 điểm
// Part 4: 1 Matching Headings = 20 điểm
// ========================================
async function createReadingSection(examId, skillType, sectionOrder) {
  const section = await ExamSection.create({
    exam_id: examId,
    skill_type_id: skillType.id,
    section_order: sectionOrder,
    duration_minutes: 60,
    instruction: 'Read the passages and answer the questions. Complete all 4 parts of the reading test.',
  });

  let questionOrder = 1;

  // Part 1: Gap Filling (1 question x 20 điểm)
  const gapFillType = await QuestionType.findOne({ where: { code: 'READING_GAP_FILL' } });
  const gapFillingQuestions = await Question.findAll({
    where: { question_type_id: gapFillType.id },
    limit: 1,
  });

  for (const q of gapFillingQuestions) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: q.id,
      question_order: questionOrder++,
      max_score: 20.0,
    });
  }

  // Part 2: Ordering (2 questions x 20 điểm)
  const orderingType = await QuestionType.findOne({ where: { code: 'READING_ORDERING' } });
  const orderingQuestions = await Question.findAll({
    where: { question_type_id: orderingType.id },
    limit: 2,
  });

  for (const q of orderingQuestions) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: q.id,
      question_order: questionOrder++,
      max_score: 20.0,
    });
  }

  // Part 3: Matching (Person-based, 1 question with 5 items x 20 điểm)
  const matchingType = await QuestionType.findOne({ where: { code: 'READING_MATCHING' } });
  const matchingQuestions = await Question.findAll({
    where: { question_type_id: matchingType.id },
    limit: 1,
  });

  if (matchingQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: matchingQuestions[0].id,
      question_order: questionOrder++,
      max_score: 20.0,
    });
  }

  // Part 4: Matching Headings (1 question with 5 items x 20 điểm)
  const headingsType = await QuestionType.findOne({ where: { code: 'READING_MATCHING_HEADINGS' } });
  const headingsQuestions = await Question.findAll({
    where: { question_type_id: headingsType.id },
    limit: 1,
  });

  if (headingsQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: headingsQuestions[0].id,
      question_order: questionOrder++,
      max_score: 20.0,
    });
  }

  console.log(`[Seed]   - Reading section: 1 Gap Fill + 2 Ordering + 1 Matching + 1 Matching Headings = 100 điểm`);
}

// ========================================
// LISTENING SECTION - 50 điểm (17 câu)
// Part 1: 5 MCQ x 3 = 15 điểm
// Part 2: 4 Speaker Matching x 3 = 12 điểm
// Part 3: 4 Statement Matching x 3 = 12 điểm
// Part 4: 4 Multi-question MCQ x 3 = 12 điểm (Tổng 17 câu = 51 điểm, làm tròn 50)
// ========================================
async function createListeningSection(examId, skillType, sectionOrder) {
  const section = await ExamSection.create({
    exam_id: examId,
    skill_type_id: skillType.id,
    section_order: sectionOrder,
    duration_minutes: 50,
    instruction: 'Listen to the recordings and answer the questions. Complete all 4 parts of the listening test.',
  });

  let questionOrder = 1;

  // Part 1: MCQ (5 câu x 3 điểm = 15 điểm)
  const listeningMcqType = await QuestionType.findOne({ where: { code: 'LISTENING_MCQ' } });
  const mcqQuestions = await Question.findAll({
    where: { question_type_id: listeningMcqType.id },
    limit: 5,
  });

  for (const q of mcqQuestions) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: q.id,
      question_order: questionOrder++,
      max_score: 3.0,
    });
  }

  // Part 2: Speaker Matching (1 question with 4 speakers x 3 điểm = 12 điểm)
  const listeningMatchingType = await QuestionType.findOne({ where: { code: 'LISTENING_MATCHING' } });
  const matchingQuestions = await Question.findAll({
    where: { question_type_id: listeningMatchingType.id },
    limit: 1,
  });

  if (matchingQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: matchingQuestions[0].id,
      question_order: questionOrder++,
      max_score: 12.0, // 4 speakers x 3 điểm
    });
  }

  // Part 3: Statement Matching (1 question with 4 statements x 3 điểm = 12 điểm)
  const statementMatchingType = await QuestionType.findOne({ where: { code: 'LISTENING_STATEMENT_MATCHING' } });
  const statementQuestions = await Question.findAll({
    where: { question_type_id: statementMatchingType.id },
    limit: 1,
  });

  if (statementQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: statementQuestions[0].id,
      question_order: questionOrder++,
      max_score: 12.0, // 4 statements x 3 điểm
    });
  }

  // Part 4: Multi-question MCQ (4 sub-questions from 2 shared audio files x 3 điểm = 12 điểm)
  // Note: These are already created in Part 1 MCQ pool but with additional_media field
  // We need to get the last 2 MCQ questions (the ones with additional_media)
  const allMcqQuestions = await Question.findAll({
    where: { question_type_id: listeningMcqType.id },
  });

  // Get the last 2 MCQ questions (which are the multi-question ones)
  const multiQuestions = allMcqQuestions.slice(-2);
  
  for (const q of multiQuestions) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: q.id,
      question_order: questionOrder++,
      max_score: 6.0, // 2 sub-questions x 3 điểm each
    });
  }

  console.log(`[Seed]   - Listening section: 5 MCQ + 4 Speakers + 4 Statements + 4 Multi-MCQ = 17 items (50 điểm)`);
}

// ========================================
// WRITING SECTION - Each part creates separate section
// ========================================
async function createWritingSection(examId, skillType, sectionOrder, writingTypeCode, sectionTitle, durationMinutes) {
  const section = await ExamSection.create({
    exam_id: examId,
    skill_type_id: skillType.id,
    section_order: sectionOrder,
    duration_minutes: durationMinutes,
    instruction: `${sectionTitle}: Follow the instructions carefully and complete within the time limit.`,
  });

  // Get the specific question type for this writing part
  const questionType = await QuestionType.findOne({ where: { code: writingTypeCode } });
  const questions = await Question.findAll({
    where: { question_type_id: questionType.id },
    limit: 1,
  });

  if (questions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: questions[0].id,
      question_order: 1,
      max_score: 12.5, // Each writing part worth 12.5 points
    });
  }

  console.log(`[Seed]   - ${sectionTitle}: 1 task x 12.5 = 12.5 điểm (${durationMinutes} minutes)`);
}

// ========================================
// SPEAKING SECTION - 50 điểm (4 tasks x 12.5)
// ========================================
async function createSpeakingSection(examId, skillType, sectionOrder) {
  const section = await ExamSection.create({
    exam_id: examId,
    skill_type_id: skillType.id,
    section_order: sectionOrder,
    duration_minutes: 12,
    instruction: 'Complete all 4 speaking tasks. Record your responses. Your speaking will be scored by AI based on fluency, pronunciation, vocabulary, and grammar.',
  });

  let questionOrder = 1;

  // Task 1: Personal
  const personalType = await QuestionType.findOne({ where: { code: 'SPEAKING_INTRO' } });
  const personalQuestions = await Question.findAll({
    where: { question_type_id: personalType.id },
    limit: 1,
  });

  if (personalQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: personalQuestions[0].id,
      question_order: questionOrder++,
      max_score: 12.5,
    });
  }

  // Task 2: Compare
  const compareType = await QuestionType.findOne({ where: { code: 'SPEAKING_COMPARISON' } });
  const compareQuestions = await Question.findAll({
    where: { question_type_id: compareType.id },
    limit: 1,
  });

  if (compareQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: compareQuestions[0].id,
      question_order: questionOrder++,
      max_score: 12.5,
    });
  }

  // Task 3: Picture description
  const pictureType = await QuestionType.findOne({ where: { code: 'SPEAKING_DESCRIPTION' } });
  const pictureQuestions = await Question.findAll({
    where: { question_type_id: pictureType.id },
    limit: 1,
  });

  if (pictureQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: pictureQuestions[0].id,
      question_order: questionOrder++,
      max_score: 12.5,
    });
  }

  // Task 4: Discussion
  const discussionType = await QuestionType.findOne({ where: { code: 'SPEAKING_DISCUSSION' } });
  const discussionQuestions = await Question.findAll({
    where: { question_type_id: discussionType.id },
    limit: 1,
  });

  if (discussionQuestions.length > 0) {
    await ExamSectionQuestion.create({
      exam_section_id: section.id,
      question_id: discussionQuestions[0].id,
      question_order: questionOrder++,
      max_score: 12.5,
    });
  }

  console.log(`[Seed]   - Speaking section: 4 tasks x 12.5 = 50 điểm (AI scoring)`);
}

// Run if called directly
if (require.main === module) {
  seedExams();
}

module.exports = seedExams;
