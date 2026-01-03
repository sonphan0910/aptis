const { 
  Question,
  QuestionType,
  QuestionItem,
  QuestionOption,
  AttemptAnswer,
  ExamAttempt
} = require('../src/models');
const ScoringService = require('../src/services/ScoringService');

/**
 * Script để test logic chấm điểm matching chi tiết
 */
async function testMatchingScoring() {
  try {
    console.log('=== TEST MATCHING SCORING ===\n');
    
    // 1. Tìm matching question
    const matchingType = await QuestionType.findOne({ 
      where: { code: 'READING_MATCHING' } 
    });
    
    if (!matchingType) {
      console.error('READING_MATCHING type not found!');
      return;
    }
    
    const matchingQuestion = await Question.findOne({
      where: { question_type_id: matchingType.id },
      include: [
        {
          model: QuestionType,
          as: 'questionType'
        }
      ]
    });
    
    if (!matchingQuestion) {
      console.error('No matching question found!');
      return;
    }
    
    console.log(`Found matching question: ${matchingQuestion.id}`);
    console.log(`Content: ${matchingQuestion.content.substring(0, 100)}...\n`);
    
    // 2. Lấy items và options
    const items = await QuestionItem.findAll({
      where: { question_id: matchingQuestion.id },
      order: [['item_order', 'ASC']]
    });
    
    const options = await QuestionOption.findAll({
      where: { question_id: matchingQuestion.id },
      order: [['option_order', 'ASC']]
    });
    
    console.log(`=== ITEMS (${items.length}) ===`);
    items.forEach((item, idx) => {
      console.log(`${idx + 1}. Item ${item.id}: "${item.item_text}" -> correct_option_id: ${item.correct_option_id}`);
    });
    
    console.log(`\n=== OPTIONS (${options.length}) ===`);
    options.forEach((opt, idx) => {
      console.log(`${idx + 1}. Option ${opt.id}: "${opt.option_text}"`);
    });
    
    // 3. Tạo correct mapping
    const correctMapping = {};
    items.forEach(item => {
      if (item.correct_option_id) {
        correctMapping[item.id] = item.correct_option_id;
      }
    });
    
    console.log(`\n=== CORRECT MAPPING ===`);
    console.log(JSON.stringify(correctMapping, null, 2));
    
    // 4. Kiểm tra xem có option nào được dùng nhiều lần không
    const optionUsageCount = {};
    Object.values(correctMapping).forEach(optionId => {
      optionUsageCount[optionId] = (optionUsageCount[optionId] || 0) + 1;
    });
    
    console.log(`\n=== OPTION USAGE IN CORRECT MAPPING ===`);
    Object.entries(optionUsageCount).forEach(([optionId, count]) => {
      const option = options.find(o => o.id === parseInt(optionId));
      console.log(`Option ${optionId} (${option?.option_text}): used ${count} time(s)${count > 1 ? ' ⚠️ DUPLICATE!' : ''}`);
    });
    
    // 5. Test scoring với các trường hợp
    console.log(`\n=== TEST SCORING SCENARIOS ===`);
    
    // Case 1: Tất cả đúng
    const perfectAnswer = {};
    items.forEach(item => {
      perfectAnswer[item.id] = item.correct_option_id;
    });
    
    console.log('\n1. PERFECT ANSWER (all correct):');
    console.log('Answer:', JSON.stringify(perfectAnswer, null, 2));
    const perfectResult = await ScoringService.scoreMatching(
      { matches: perfectAnswer }, 
      correctMapping
    );
    console.log('Result:', perfectResult);
    console.log(`Score: ${perfectResult.correct}/${perfectResult.total} = ${perfectResult.percentage.toFixed(2)}%`);
    
    // Case 2: Một nửa đúng
    const halfCorrectAnswer = {};
    items.forEach((item, idx) => {
      if (idx < items.length / 2) {
        halfCorrectAnswer[item.id] = item.correct_option_id;
      } else {
        // Chọn sai
        const wrongOption = options.find(o => o.id !== item.correct_option_id);
        halfCorrectAnswer[item.id] = wrongOption?.id || null;
      }
    });
    
    console.log('\n2. HALF CORRECT ANSWER:');
    console.log('Answer:', JSON.stringify(halfCorrectAnswer, null, 2));
    const halfResult = await ScoringService.scoreMatching(
      { matches: halfCorrectAnswer }, 
      correctMapping
    );
    console.log('Result:', halfResult);
    console.log(`Score: ${halfResult.correct}/${halfResult.total} = ${halfResult.percentage.toFixed(2)}%`);
    
    // Case 3: Tất cả sai
    const allWrongAnswer = {};
    items.forEach((item, idx) => {
      // Chọn option tiếp theo (circular)
      const nextOptionIdx = (idx + 1) % options.length;
      allWrongAnswer[item.id] = options[nextOptionIdx].id;
    });
    
    console.log('\n3. ALL WRONG ANSWER:');
    console.log('Answer:', JSON.stringify(allWrongAnswer, null, 2));
    const wrongResult = await ScoringService.scoreMatching(
      { matches: allWrongAnswer }, 
      correctMapping
    );
    console.log('Result:', wrongResult);
    console.log(`Score: ${wrongResult.correct}/${wrongResult.total} = ${wrongResult.percentage.toFixed(2)}%`);
    
    // 6. Kiểm tra actual attempts gần đây
    console.log('\n=== RECENT ACTUAL ATTEMPTS ===');
    
    const recentAnswers = await AttemptAnswer.findAll({
      where: { question_id: matchingQuestion.id },
      limit: 3,
      order: [['answered_at', 'DESC']],
      include: [
        {
          model: ExamAttempt,
          as: 'attempt',
          attributes: ['id', 'student_id', 'status']
        }
      ]
    });
    
    if (recentAnswers.length === 0) {
      console.log('No recent answers found for this matching question.');
    } else {
      for (const answer of recentAnswers) {
        console.log(`\n--- Answer ${answer.id} (Attempt ${answer.attempt_id}) ---`);
        console.log(`Score: ${answer.score}/${answer.max_score}`);
        console.log(`Answer JSON: ${answer.answer_json}`);
        
        if (answer.answer_json) {
          try {
            const parsed = JSON.parse(answer.answer_json);
            const studentAnswer = parsed.matches || parsed;
            
            console.log('Student Answer:', JSON.stringify(studentAnswer, null, 2));
            
            // Re-score để verify
            const verifyResult = await ScoringService.scoreMatching(
              studentAnswer,
              correctMapping
            );
            
            console.log('Verified Score:', verifyResult);
            console.log(`Should be: ${verifyResult.correct}/${verifyResult.total} = ${verifyResult.percentage.toFixed(2)}%`);
            
            const expectedScore = (verifyResult.correct / verifyResult.total) * answer.max_score;
            console.log(`Expected score with max_score ${answer.max_score}: ${expectedScore.toFixed(2)}`);
            
            if (Math.abs(answer.score - expectedScore) > 0.01) {
              console.log(`⚠️ MISMATCH! Stored score (${answer.score}) != Expected score (${expectedScore.toFixed(2)})`);
            } else {
              console.log(`✓ Score is correct`);
            }
            
            // Show detail của từng match
            console.log('\nDetail matches:');
            items.forEach(item => {
              const studentOptionId = parseInt(studentAnswer[item.id]);
              const correctOptionId = parseInt(correctMapping[item.id]);
              const studentOption = options.find(o => o.id === studentOptionId);
              const correctOption = options.find(o => o.id === correctOptionId);
              const isCorrect = studentOptionId === correctOptionId;
              
              console.log(`  ${item.item_text} -> ${studentOption?.option_text || 'NOT ANSWERED'} ${isCorrect ? '✓' : `✗ (correct: ${correctOption?.option_text})`}`);
            });
            
          } catch (error) {
            console.error('Error parsing answer JSON:', error);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

module.exports = { testMatchingScoring };
