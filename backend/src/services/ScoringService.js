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
   * answerJson format: { "item1_id": "option3_id", "item2_id": "option1_id", ... }
   * correctMapping format: { "item1_id": "correct_option_id", ... }
   */
  async scoreMatching(answerJson, correctMapping) {
    try {
      const answer = typeof answerJson === 'string' ? JSON.parse(answerJson) : answerJson;

      let correct = 0;
      const total = Object.keys(correctMapping).length;

      for (const [itemId, selectedOptionId] of Object.entries(answer)) {
        if (correctMapping[itemId] && correctMapping[itemId] === selectedOptionId) {
          correct++;
        }
      }

      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      throw new BadRequestError('Invalid answer JSON format for matching question');
    }
  }

  /**
   * Score gap filling question
   * answer format: ["answer1", "answer2", "answer3"]
   * correctAnswers format: ["correct1", "correct2", "correct3"]
   */
  async scoreGapFilling(answer, correctAnswers) {
    try {
      const answerArray = Array.isArray(answer) ? answer : JSON.parse(answer);

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

    // MCQ questions
    if (questionTypeCode.includes('mcq')) {
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
    } else if (questionTypeCode === 'matching') {
      // Get correct mapping from question_items
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        include: [
          {
            model: QuestionOption,
            as: 'options',
            where: { is_correct: true },
          },
        ],
      });

      const correctMapping = {};
      items.forEach((item) => {
        if (item.options && item.options.length > 0) {
          correctMapping[item.id] = item.options[0].id;
        }
      });

      const result = await this.scoreMatching(answer.answer_json, correctMapping);
      score = (result.correct / result.total) * answer.max_score;
    } else if (questionTypeCode === 'fill_blanks' || questionTypeCode === 'gap_filling') {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']],
      });

      const correctAnswers = items.map((item) => item.answer_text);
      const result = await this.scoreGapFilling(answer.answer_json, correctAnswers);
      score = (result.correct / result.total) * answer.max_score;
    } else if (questionTypeCode === 'ordering') {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']],
      });

      const correctOrder = items.map((item) => item.id);
      const result = await this.scoreOrdering(answer.answer_json, correctOrder);
      score = (result.correct / result.total) * answer.max_score;
    }

    return Math.round(score * 100) / 100; // Round to 2 decimal places
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

    if (score !== null) {
      await answer.update({
        score,
        auto_graded_at: new Date(),
      });
    }

    return score;
  }
}

module.exports = new ScoringService();
