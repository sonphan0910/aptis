const { AttemptAnswer, QuestionOption, QuestionItem } = require('../models');
const { SCORING_METHODS } = require('../utils/constants');
const { BadRequestError } = require('../utils/errors');

/**
 * ScoringService - Handles automatic scoring for MCQ, Matching, Gap Filling, Ordering
 */
class ScoringService {
  /**
   * Score multiple choice question
   */
  async scoreMultipleChoice(selectedOptionId, correctOptionId) {
    return selectedOptionId === correctOptionId;
  }

  /**
   * Score matching question
   * answerJson format: { "matches": { "item1_id": "option3_id", "item2_id": "option1_id", ... } }
   * correctMapping format: { "item1_id": "correct_option_id", ... }
   */
  async scoreMatching(answerJson, correctMapping) {
    try {
      const parsed = typeof answerJson === 'string' ? JSON.parse(answerJson) : answerJson;
      
      // Handle both formats: direct matches object or wrapped in { matches: {...} }
      const answer = parsed.matches || parsed;

      let correct = 0;
      const total = Object.keys(correctMapping).length;

      // If no correct mapping found, return 0 score
      if (total === 0) {
        console.log('[ScoringService] No correct mapping found for matching question');
        return { correct: 0, total: 1, percentage: 0 }; // Avoid division by zero
      }

      for (const [itemId, selectedOptionId] of Object.entries(answer)) {
        if (selectedOptionId && correctMapping[itemId]) {
          // Convert both to numbers for comparison (handle string/number mismatch)
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
      throw new BadRequestError('Invalid answer JSON format for matching question');
    }
  }

  /**
   * Score gap filling question
   * answer format: { "gap_answers": ["answer1", "answer2", "answer3"] }
   * correctAnswers format: ["correct1", "correct2", "correct3"]
   */
  async scoreGapFilling(answerJson, correctAnswers) {
    try {
      const parsed = typeof answerJson === 'string' ? JSON.parse(answerJson) : answerJson;
      
      // Handle both formats: direct array or wrapped in { gap_answers: [...] }
      const answerArray = parsed.gap_answers || parsed;

      let correct = 0;
      const total = correctAnswers.length;

      for (let i = 0; i < total; i++) {
        if (
          answerArray[i] &&
          answerArray[i].trim().toLowerCase() === correctAnswers[i].trim().toLowerCase()
        ) {
          correct++;
        }
      }

      console.log('[ScoringService] Gap filling scoring:', { answerArray, correctAnswers, correct, total });
      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      throw new BadRequestError('Invalid answer format for gap filling question');
    }
  }

  /**
   * Score ordering question
   * itemOrder format: [3, 1, 4, 2] (order of item IDs)
   * correctOrder format: [1, 2, 3, 4] (correct order of item IDs)
   */
  async scoreOrdering(itemOrder, correctOrder) {
    try {
      const order = Array.isArray(itemOrder) ? itemOrder : JSON.parse(itemOrder);

      let correct = 0;
      const total = correctOrder.length;

      for (let i = 0; i < total; i++) {
        if (order[i] === correctOrder[i]) {
          correct++;
        }
      }

      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      throw new BadRequestError('Invalid answer format for ordering question');
    }
  }

  /**
   * Score a single answer based on question type
   */
  async scoreAnswer(answer, question) {
    const { scoring_method } = question.questionType;

    // Only auto-score questions with 'auto' scoring method
    if (scoring_method !== SCORING_METHODS.AUTO) {
      return null;
    }

    const questionTypeCode = question.questionType.code;
    let score = 0;

    // MCQ questions (including GV_MCQ, READING_MCQ, LISTENING_MCQ, etc.)
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
      // Get correct mapping from question_items using correct_option_id field
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
      const result = await this.scoreGapFilling(answer.answer_json, correctAnswers);
      score = (result.correct / result.total) * answer.max_score;
    } else if (questionTypeCode.includes('ORDERING')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']],
      });

      const correctOrder = items.map((item) => item.id);
      const result = await this.scoreOrdering(answer.answer_json, correctOrder);
      score = (result.correct / result.total) * answer.max_score;
    }

    // Ensure score never exceeds max_score
    const finalScore = Math.min(score, answer.max_score);
    return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate total score for an attempt
   */
  async calculateAttemptScore(attemptId) {
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
    });

    let totalScore = 0;

    for (const answer of answers) {
      // Use final_score if reviewed, otherwise use score
      const answerScore = answer.final_score !== null ? answer.final_score : answer.score;

      if (answerScore !== null) {
        totalScore += parseFloat(answerScore);
      }
    }

    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Auto-grade an answer immediately after submission
   */
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
      // Additional safeguard: ensure score doesn't exceed max_score
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
