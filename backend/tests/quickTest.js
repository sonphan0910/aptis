/**
 * Test nhanh AiScoringService với Writing question
 */

require('dotenv').config();
const {
  AttemptAnswer,
  Question,
  QuestionType,
  Exam,
  ExamAttempt,
  User,
  AnswerAiFeedback,
} = require('../src/models');
const AiScoringService = require('../src/services/AiScoringService');

async function quickTest() {
  console.log('\n========== QUICK TEST AI SCORING ==========\n');

  try {
    // Tìm WRITING question
    const writingQuestion = await Question.findOne({
      include: [
        {
          model: QuestionType,
          as: 'questionType',
          where: { 
            scoring_method: 'ai',
            code: { [require('sequelize').Op.like]: 'WRITING_%' }
          },
        },
      ],
    });

    if (!writingQuestion) {
      console.log('❌ Không tìm thấy WRITING question');
      return;
    }

    console.log(`✅ Found WRITING question: ${writingQuestion.questionType.code}`);

    // Tìm user
    const user = await User.findOne({ where: { role: 'student' } });
    const exam = await Exam.findOne({ where: { status: 'published' } });

    // Tạo attempt
    const attempt = await ExamAttempt.create({
      student_id: user.id,
      exam_id: exam.id,
      attempt_type: 'full_exam',
      start_time: new Date(),
      status: 'in_progress',
    });

    // Tạo writing answer
    const answer = await AttemptAnswer.create({
      attempt_id: attempt.id,
      question_id: writingQuestion.id,
      answer_type: 'text',
      text_answer: 'I have many hobbies. I like playing tennis because it keeps me healthy and active. I also enjoy reading books, especially science fiction novels. Reading helps me improve my vocabulary and learn new things. Additionally, I love cooking different dishes from various countries. It is creative and I can share delicious food with my friends and family.',
      max_score: 5,
    });

    console.log(`✅ Created answer ID: ${answer.id}`);

    // Test scoreWriting
    console.log('\n🎯 Testing scoreWriting()...');
    const result = await AiScoringService.scoreWriting(answer.id);

    console.log(`\n✅ RESULTS:`);
    console.log(`Score: ${result.score}`);
    console.log(`CEFR: ${result.cefrLevel}`);
    console.log(`Comment: ${result.comment?.substring(0, 100)}...`);
    console.log(`Strengths: ${result.strengths?.substring(0, 80)}...`);
    console.log(`Weaknesses: ${result.weaknesses?.substring(0, 80)}...`);

    // Check feedback in DB
    const feedback = await AnswerAiFeedback.findOne({
      where: { answer_id: answer.id },
    });

    if (feedback) {
      console.log(`\n✅ Feedback saved in DB: Score ${feedback.score}, CEFR ${feedback.cefr_level}`);
    }

    console.log('\n✅ QUICK TEST SUCCESSFUL!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

quickTest();