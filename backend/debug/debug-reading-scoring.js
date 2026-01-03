const { 
  ExamAttempt, 
  AttemptAnswer, 
  ExamSectionQuestion, 
  Question, 
  QuestionType,
  QuestionItem,
  ExamSection,
  SkillType 
} = require('../src/models');

/**
 * Script để debug và kiểm tra logic chấm điểm Reading
 */
async function debugReadingScoring() {
  try {
    console.log('=== DEBUG READING SCORING ===');
    
    // 1. Kiểm tra cấu trúc Reading section
    const readingSkill = await SkillType.findOne({ 
      where: { code: 'READING' } 
    });
    
    if (!readingSkill) {
      console.error('Reading skill type not found!');
      return;
    }
    
    // 2. Lấy tất cả Reading sections
    const readingSections = await ExamSection.findAll({
      where: { skill_type_id: readingSkill.id },
      include: [
        {
          model: ExamSectionQuestion,
          as: 'questions',
          include: [
            {
              model: Question,
              as: 'question',
              include: [
                {
                  model: QuestionType,
                  as: 'questionType'
                }
              ]
            }
          ]
        }
      ]
    });
    
    console.log(`Found ${readingSections.length} Reading sections`);
    
    for (const section of readingSections) {
      console.log(`\n--- Section ${section.id} ---`);
      
      let totalMaxScore = 0;
      const questionsByType = {};
      
      for (const esq of section.questions) {
        const questionType = esq.question.questionType.code;
        
        if (!questionsByType[questionType]) {
          questionsByType[questionType] = {
            count: 0,
            totalScore: 0
          };
        }
        
        questionsByType[questionType].count++;
        questionsByType[questionType].totalScore += parseFloat(esq.max_score);
        totalMaxScore += parseFloat(esq.max_score);
        
        // Kiểm tra đặc biệt cho MATCHING questions
        if (questionType === 'READING_MATCHING') {
          console.log(`  Matching Question ${esq.question_id}: max_score=${esq.max_score}`);
          
          // Kiểm tra items
          const items = await QuestionItem.findAll({
            where: { question_id: esq.question_id }
          });
          
          console.log(`    Items count: ${items.length}`);
          items.forEach(item => {
            console.log(`    Item ${item.id}: correct_option_id=${item.correct_option_id}`);
          });
        }
      }
      
      console.log(`Total questions: ${section.questions.length}`);
      console.log(`Total max score: ${totalMaxScore}`);
      console.log('Question types breakdown:');
      
      Object.entries(questionsByType).forEach(([type, data]) => {
        console.log(`  ${type}: ${data.count} questions = ${data.totalScore} points`);
      });
    }
    
    // 3. Kiểm tra attempts gần đây với Reading
    console.log('\n=== RECENT READING ATTEMPTS ===');
    
    const recentAttempts = await ExamAttempt.findAll({
      limit: 3,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: AttemptAnswer,
          as: 'answers',
          include: [
            {
              model: Question,
              as: 'question',
              include: [
                {
                  model: QuestionType,
                  as: 'questionType',
                  include: [
                    {
                      model: SkillType,
                      as: 'skillType',
                      where: { code: 'READING' }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
    
    for (const attempt of recentAttempts) {
      console.log(`\n--- Attempt ${attempt.id} ---`);
      console.log(`Total score: ${attempt.total_score}`);
      
      const readingAnswers = attempt.answers.filter(a => 
        a.question?.questionType?.skillType?.code === 'READING'
      );
      
      console.log(`Reading answers: ${readingAnswers.length}`);
      
      let readingScore = 0;
      let readingMaxScore = 0;
      
      const answersByType = {};
      
      for (const answer of readingAnswers) {
        const questionType = answer.question.questionType.code;
        
        if (!answersByType[questionType]) {
          answersByType[questionType] = {
            count: 0,
            score: 0,
            maxScore: 0
          };
        }
        
        const answerScore = answer.final_score !== null ? answer.final_score : (answer.score || 0);
        
        answersByType[questionType].count++;
        answersByType[questionType].score += parseFloat(answerScore);
        answersByType[questionType].maxScore += parseFloat(answer.max_score);
        
        readingScore += parseFloat(answerScore);
        readingMaxScore += parseFloat(answer.max_score);
        
        // Chi tiết cho MATCHING
        if (questionType === 'READING_MATCHING') {
          console.log(`  MATCHING Answer ${answer.id}:`);
          console.log(`    Score: ${answerScore}/${answer.max_score}`);
          console.log(`    Answer JSON: ${answer.answer_json}`);
        }
      }
      
      console.log(`Reading total: ${readingScore}/${readingMaxScore} (${readingMaxScore > 0 ? Math.round((readingScore/readingMaxScore)*100) : 0}%)`);
      
      console.log('By type:');
      Object.entries(answersByType).forEach(([type, data]) => {
        const percentage = data.maxScore > 0 ? Math.round((data.score/data.maxScore)*100) : 0;
        console.log(`  ${type}: ${data.score}/${data.maxScore} (${percentage}%) - ${data.count} questions`);
      });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

module.exports = { debugReadingScoring };