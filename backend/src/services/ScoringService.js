const { AttemptAnswer, QuestionOption, QuestionItem } = require('../models');
const { SCORING_METHODS } = require('../utils/constants');
const { BadRequestError } = require('../utils/errors');


class ScoringService {
  async scoreMultipleChoice(selectedOptionId, correctOptionId) {
    return selectedOptionId === correctOptionId;
  }


  async scoreMatching(answerJson, correctMapping) {
    try {
      if (!answerJson) {
        console.log('[ScoringService] Matching: No answer provided');
        return { correct: 0, total: Object.keys(correctMapping).length, percentage: 0 };
      }


      const parsed = typeof answerJson === 'string' ? JSON.parse(answerJson) : answerJson;
      const answer = parsed.matches || parsed;


      let correct = 0;
      const total = Object.keys(correctMapping).length;


      if (total === 0) {
        console.log('[ScoringService] No correct mapping found for matching question');
        return { correct: 0, total: 1, percentage: 0 };
      }


      for (const [itemId, selectedOptionId] of Object.entries(answer)) {
        if (selectedOptionId && correctMapping[itemId]) {
          const selectedId = parseInt(selectedOptionId);
          const correctId = parseInt(correctMapping[itemId]);
          if (selectedId === correctId) {
            correct++;
          }
        }
      }


      console.log('[ScoringService] Matching scoring:', { answer, correctMapping, correct, total });
      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      console.error('[ScoringService] Matching scoring error:', error);
      return { correct: 0, total: Object.keys(correctMapping).length, percentage: 0 };
    }
  }


  async scoreGapFilling(answerJson, correctAnswers) {
    try {
      if (!answerJson) {
        console.log('[ScoringService] Gap filling: No answer provided');
        return { correct: 0, total: correctAnswers.length, percentage: 0 };
      }


      const parsed = typeof answerJson === 'string' ? JSON.parse(answerJson) : answerJson;
      let answerArray = [];
      if (parsed.gap_answers) {
        answerArray = parsed.gap_answers;
      } else if (parsed.gaps) {
        answerArray = correctAnswers.map((_, index) => {
          const key = Object.keys(parsed.gaps)[index];
          return key ? parsed.gaps[key] : '';
        });
      } else if (Array.isArray(parsed)) {
        answerArray = parsed;
      } else {
        answerArray = Object.values(parsed);
      }


      let correct = 0;
      const total = correctAnswers.length;


      for (let i = 0; i < total; i++) {
        const userAnswer = answerArray[i];
        const correctAnswer = correctAnswers[i];
        if (
          userAnswer &&
          correctAnswer &&
          userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase()
        ) {
          correct++;
        }
      }


      console.log('[ScoringService] Gap filling scoring:', { answerArray, correctAnswers, correct, total });
      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      console.error('[ScoringService] Gap filling scoring error:', error);
      return { correct: 0, total: correctAnswers.length, percentage: 0 };
    }
  }


  async scoreOrdering(itemOrder, correctOrder) {
    try {
      if (!itemOrder) {
        console.log('[ScoringService] Ordering: No answer provided');
        return { correct: 0, total: correctOrder.length, percentage: 0 };
      }


      let order = [];
      if (typeof itemOrder === 'string') {
        const parsed = JSON.parse(itemOrder);
        if (parsed.ordered_items) {
          order = parsed.ordered_items.map(item => item.id || item.original_order);
        } else if (parsed.order) {
          order = Object.values(parsed.order);
        } else if (Array.isArray(parsed)) {
          order = parsed;
        }
      } else if (Array.isArray(itemOrder)) {
        order = itemOrder;
      } else if (typeof itemOrder === 'object') {
        if (itemOrder.ordered_items) {
          order = itemOrder.ordered_items.map(item => item.id || item.original_order);
        } else if (itemOrder.order) {
          order = Object.values(itemOrder.order);
        } else {
          order = Object.values(itemOrder);
        }
      }


      let correct = 0;
      const total = correctOrder.length;


      for (let i = 0; i < total && i < order.length; i++) {
        if (order[i] === correctOrder[i]) {
          correct++;
        }
      }


      console.log('[ScoringService] Ordering scoring:', { order, correctOrder, correct, total });
      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      console.error('[ScoringService] Ordering scoring error:', error);
      return { correct: 0, total: correctOrder.length, percentage: 0 };
    }
  }


  async scoreAnswer(answer, question) {
    const { scoring_method } = question.questionType;
    if (scoring_method !== SCORING_METHODS.AUTO) {
      return null;
    }
    const questionTypeCode = question.questionType.code;
    let score = 0;
    console.log(`[ScoringService] Scoring question ${question.id}, type: ${questionTypeCode}`);
    console.log(`[ScoringService] Answer data:`, {
      answer_type: answer.answer_type,
      answer_json: answer.answer_json,
      selected_option_id: answer.selected_option_id,
      text_answer: answer.text_answer
    });
    if (questionTypeCode.includes('MCQ') || questionTypeCode.includes('TRUE_FALSE')) {
      const correctOption = await QuestionOption.findOne({
        where: {
          question_id: question.id,
          is_correct: true,
        },
      });
      const isCorrect = await this.scoreMultipleChoice(
        answer.selected_option_id,
        correctOption?.id,
      );
      score = isCorrect ? answer.max_score : 0;
    } else if (questionTypeCode.includes('MATCHING')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id }
      });
      const correctMapping = {};
      items.forEach((item) => {
        if (item.correct_option_id) {
          correctMapping[item.id] = item.correct_option_id;
        }
      });
      console.log('[ScoringService] Matching question', question.id, 'correct mapping:', correctMapping);
      const result = await this.scoreMatching(answer.answer_json, correctMapping);
      score = result.total > 0 ? (result.correct / result.total) * answer.max_score : 0;
    } else if (questionTypeCode.includes('GAP_FILL') || questionTypeCode.includes('FILL')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']],
      });
      const correctAnswers = items.map((item) => item.answer_text);
      console.log('[ScoringService] Gap filling correct answers:', correctAnswers);
      const result = await this.scoreGapFilling(answer.answer_json, correctAnswers);
      score = (result.correct / result.total) * answer.max_score;
    } else if (questionTypeCode.includes('ORDERING')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']],
      });
      const correctOrder = items.map((item, index) => {
        const position = parseInt(item.answer_text);
        return isNaN(position) ? (index + 1) : position;
      });
      console.log('[ScoringService] Ordering correct order:', correctOrder);
      const result = await this.scoreOrdering(answer.answer_json, correctOrder);
      score = (result.correct / result.total) * answer.max_score;
    }
    const finalScore = Math.min(score, answer.max_score);
    console.log(`[ScoringService] Final score: ${finalScore}/${answer.max_score}`);
    return Math.round(finalScore * 100) / 100;
  }


  async calculateAttemptScore(attemptId) {
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
    });
    let totalScore = 0;
    for (const answer of answers) {
      const answerScore = answer.final_score !== null ? answer.final_score : answer.score;
      if (answerScore !== null) {
        totalScore += parseFloat(answerScore);
      }
    }
    return Math.round(totalScore * 100) / 100;
  }

  async autoGradeAnswer(answerId) {
    const answer = await AttemptAnswer.findByPk(answerId, {
      include: [
        {
          model: require('../models').Question,
          as: 'question',
          include: [
            {
              model: require('../models').QuestionType,
              as: 'questionType',
            },
          ],
        },
      ],
    });
    if (!answer) {
      throw new BadRequestError('Answer not found');
    }
    const score = await this.scoreAnswer(answer, answer.question);
    console.log(`[ScoringService] Auto-grading Q${answer.question_id}: calculated=${score}, max_score=${answer.max_score}`);
    if (score !== null) {
      const finalScore = Math.min(score, answer.max_score);
      if (finalScore !== score) {
        console.warn(`[ScoringService] ⚠️  Score capped: ${score} -> ${finalScore} (max: ${answer.max_score})`);
      }
      await answer.update({
        score: finalScore,
        auto_graded_at: new Date(),
      });
      return finalScore;
    }
    return score;
  }
}

module.exports = new ScoringService();
