const { AttemptAnswer, QuestionOption, QuestionItem } = require('../models');
const { SCORING_METHODS } = require('../utils/constants');
const { BadRequestError } = require('../utils/errors');


class ScoringService {
  async scoreMultipleChoice(selectedOptionId, correctOptionId) {
    if (selectedOptionId === null || selectedOptionId === undefined || correctOptionId === null || correctOptionId === undefined) return false;
    return parseInt(selectedOptionId) === parseInt(correctOptionId);
  }


  async scoreMatching(answerJson, correctMapping, totalItemsCount, items = [], options = []) {
    try {
      if (answerJson === null || answerJson === undefined || answerJson === '') {
        console.log('[ScoringService] Matching: No answer provided');
        return { correct: 0, total: totalItemsCount || 1, percentage: 0 };
      }

      const parsed = typeof answerJson === 'string' ? JSON.parse(answerJson) : answerJson;
      const answer = parsed.matches || parsed;

      let correct = 0;
      const total = totalItemsCount || Object.keys(correctMapping).length || 1;

      // Build a text-based mapping for fallback (old format support)
      const textMapping = {}; // itemId -> { correctText, correctOptionId }
      items.forEach(item => {
        if (item.answer_text) {
          textMapping[item.id] = {
            correctText: item.answer_text,
            correctOptionId: item.correct_option_id
          };
        }
      });

      // Build option ID to text mapping
      const optionIdToText = {};
      options.forEach(opt => {
        optionIdToText[opt.id] = opt.option_text;
      });

      console.log('[ScoringService] Matching debug:', {
        answerKeys: Object.keys(answer),
        correctMappingKeys: Object.keys(correctMapping),
        textMappingKeys: Object.keys(textMapping)
      });

      // Handle both Item-ID based objects and Index-based arrays/objects
      for (const [key, selectedValue] of Object.entries(answer)) {
        if (selectedValue === null || selectedValue === undefined || selectedValue === '') continue;

        // Try to find the correct option ID for this key (ID or Index)
        const correctOptionId = correctMapping[key];
        const textData = textMapping[key];

        let isCorrectMatch = false;

        // Check 1: Try numeric comparison (new format - option IDs)
        const selectedNumeric = parseInt(selectedValue);
        if (!isNaN(selectedNumeric) && correctOptionId !== null && correctOptionId !== undefined) {
          if (selectedNumeric === parseInt(correctOptionId)) {
            isCorrectMatch = true;
          }
        }

        // Check 2: Try text comparison (old format - text values like "Person A")
        if (!isCorrectMatch && textData && textData.correctText) {
          const selectedText = String(selectedValue).trim().toLowerCase();
          const correctText = String(textData.correctText).trim().toLowerCase();
          if (selectedText === correctText) {
            isCorrectMatch = true;
          }
        }

        // Check 3: Compare selected text with correct option text (handles cases where user selected text matches option)
        if (!isCorrectMatch && correctOptionId && optionIdToText[correctOptionId]) {
          const correctOptionText = String(optionIdToText[correctOptionId]).trim().toLowerCase();
          const selectedText = String(selectedValue).trim().toLowerCase();
          if (selectedText === correctOptionText) {
            isCorrectMatch = true;
          }
        }

        // Check 4: Handle case where answer_text is just a letter "A" but user selected option ID for "Person A"
        if (!isCorrectMatch && !isNaN(selectedNumeric) && textData && textData.correctText) {
          const selectedOptionText = optionIdToText[selectedNumeric];
          if (selectedOptionText) {
            const correctLetter = String(textData.correctText).trim().toUpperCase();
            // Extract letter from "Person A" -> "A"
            const match = selectedOptionText.match(/Person\s+([A-Z])/i);
            if (match && match[1].toUpperCase() === correctLetter) {
              isCorrectMatch = true;
            }
            // Also check if selected option text ends with the correct letter
            if (!isCorrectMatch && selectedOptionText.toUpperCase().endsWith(correctLetter)) {
              isCorrectMatch = true;
            }
          }
        }

        if (isCorrectMatch) {
          correct++;
        }
      }

      console.log('[ScoringService] Matching scoring result:', { correct, total });
      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      console.error('[ScoringService] Matching scoring error:', error);
      return { correct: 0, total: totalItemsCount || 1, percentage: 0 };
    }
  }



  async scoreGapFilling(answerJson, correctAnswersOrItems) {
    try {
      if (answerJson === null || answerJson === undefined || answerJson === '') {
        console.log('[ScoringService] Gap filling: No answer provided');
        const total = Array.isArray(correctAnswersOrItems) ? correctAnswersOrItems.length : 1;
        return { correct: 0, total, percentage: 0 };
      }

      const parsed = typeof answerJson === 'string' ? JSON.parse(answerJson) : answerJson;

      // Determine if correctAnswersOrItems is an array of items (with id and answer_text) 
      // or just an array of correct answer strings
      let items = [];
      let correctAnswers = [];

      if (Array.isArray(correctAnswersOrItems)) {
        if (correctAnswersOrItems.length > 0 && typeof correctAnswersOrItems[0] === 'object' && correctAnswersOrItems[0].id !== undefined) {
          // Array of item objects with id and answer_text
          items = correctAnswersOrItems;
          correctAnswers = items.map(item => item.answer_text || '');
        } else {
          // Array of correct answer strings (legacy format)
          correctAnswers = correctAnswersOrItems;
        }
      }

      let answerArray = [];

      // Handle { gaps: { [itemId]: text } } format from frontend
      if (parsed.gaps && typeof parsed.gaps === 'object' && items.length > 0) {
        console.log('[ScoringService] Gap filling: Using gaps object format with item IDs');
        // Map gaps by item ID to array in correct order
        answerArray = items.map(item => {
          const val = parsed.gaps[item.id] !== undefined ? parsed.gaps[item.id] : parsed.gaps[String(item.id)];
          return val !== undefined && val !== null ? val : '';
        });
      } else if (parsed.gap_answers) {
        answerArray = parsed.gap_answers;
      } else if (Array.isArray(parsed)) {
        answerArray = parsed;
      } else if (typeof parsed === 'object') {
        // Map by index to ensure order matches correctAnswers (legacy fallback)
        answerArray = correctAnswers.map((_, index) => {
          const val = parsed[index] !== undefined ? parsed[index] : parsed[String(index)];
          return val !== undefined && val !== null ? val : '';
        });
      }

      let correct = 0;
      const total = correctAnswers.length;

      console.log('[ScoringService] Gap filling debug:', { answerArray, correctAnswers });

      for (let i = 0; i < total; i++) {
        const userAnswer = answerArray[i];
        const correctAnswer = correctAnswers[i];
        if (
          userAnswer !== undefined && userAnswer !== null &&
          correctAnswer !== undefined && correctAnswer !== null &&
          userAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase()
        ) {
          correct++;
        }
      }

      console.log('[ScoringService] Gap filling scoring:', { correct, total });
      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      console.error('[ScoringService] Gap filling scoring error:', error);
      const total = Array.isArray(correctAnswersOrItems) ? correctAnswersOrItems.length : 1;
      return { correct: 0, total, percentage: 0 };
    }
  }



  async scoreOrdering(itemOrder, correctOrderIds) {
    try {
      if (itemOrder === null || itemOrder === undefined || itemOrder === '') {
        console.log('[ScoringService] Ordering: No answer provided');
        return { correct: 0, total: correctOrderIds.length, percentage: 0 };
      }


      let userOrderIds = [];
      if (typeof itemOrder === 'string') {
        try {
          const parsed = JSON.parse(itemOrder);
          if (parsed.ordered_items) {
            userOrderIds = parsed.ordered_items.map(item => item.id || item);
          } else if (parsed.order) {
            userOrderIds = Array.isArray(parsed.order) ? parsed.order : Object.values(parsed.order);
          } else if (Array.isArray(parsed)) {
            userOrderIds = parsed;
          }
        } catch (e) {
          userOrderIds = [];
        }
      } else if (Array.isArray(itemOrder)) {
        userOrderIds = itemOrder;
      } else if (typeof itemOrder === 'object') {
        if (itemOrder.ordered_items) {
          userOrderIds = itemOrder.ordered_items.map(item => item.id || item);
        } else if (itemOrder.order) {
          userOrderIds = Array.isArray(itemOrder.order) ? itemOrder.order : Object.values(itemOrder.order);
        } else {
          userOrderIds = Object.values(itemOrder);
        }
      }


      let correct = 0;
      const total = correctOrderIds.length;


      for (let i = 0; i < total && i < userOrderIds.length; i++) {
        const uId = userOrderIds[i];
        const cId = correctOrderIds[i];
        if (uId !== null && uId !== undefined && cId !== null && cId !== undefined && parseInt(uId) === parseInt(cId)) {
          correct++;
        }
      }


      console.log('[ScoringService] Ordering scoring:', { correct, total });
      return { correct, total, percentage: (correct / total) * 100 };
    } catch (error) {
      console.error('[ScoringService] Ordering scoring error:', error);
      return { correct: 0, total: correctOrderIds.length, percentage: 0 };
    }
  }


  async scoreAnswer(answer, question) {
    const { scoring_method } = question.questionType;
    if (scoring_method !== SCORING_METHODS.AUTO) {
      return null;
    }
    const questionTypeCode = (question.questionType.code || '').toUpperCase();
    let score = 0;

    // Parse question content JSON if available for fallbacks
    let contentData = null;
    try {
      if (question.content) {
        contentData = typeof question.content === 'string' ? JSON.parse(question.content) : question.content;
      }
    } catch (e) {
      console.warn('[ScoringService] Failed to parse question content for Q' + question.id);
    }

    console.log(`[ScoringService] Scoring question ${question.id}, type: ${questionTypeCode}`);

    if (questionTypeCode.includes('MCQ') || questionTypeCode.includes('TRUE_FALSE') || questionTypeCode.includes('MULTIPLE_CHOICE')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']]
      });

      const options = await QuestionOption.findAll({
        where: { question_id: question.id },
        order: [['option_order', 'ASC']]
      });

      // Determine if Multi-Question structure
      const isMulti = items.length > 1 || questionTypeCode.includes('MULTI') || (contentData?.questions && contentData.questions.length > 1);

      if (isMulti) {
        let userAnswers = {};
        try {
          if (answer.answer_json) {
            userAnswers = typeof answer.answer_json === 'string' ? JSON.parse(answer.answer_json) : answer.answer_json;
            if (Array.isArray(userAnswers)) {
              userAnswers = userAnswers.reduce((acc, val, idx) => { acc[idx] = val; return acc; }, {});
            }
          }
        } catch (e) { console.warn('JSON Parse error for Multi-MCQ answer'); }

        let correctCount = 0;
        const total = items.length > 0 ? items.length : (contentData?.questions?.length || 1);

        for (let idx = 0; idx < total; idx++) {
          const item = items[idx];
          const itemId = item ? item.id : `json-${idx}`;
          const userAnswerId = userAnswers[itemId] !== undefined ? userAnswers[itemId] : (userAnswers[idx] !== undefined ? userAnswers[idx] : userAnswers[String(idx)]);

          if (userAnswerId === null || userAnswerId === undefined) continue;

          // Find correct option for this item/index
          let correctOptionId = null;

          // 1. Database check
          if (item) {
            const dbCorrect = options.find(opt => opt.item_id === item.id && opt.is_correct);
            if (dbCorrect) correctOptionId = dbCorrect.id;
          }

          // 2. Fallback: Sequential slice (assuming N options per item)
          if (correctOptionId === null && items.length > 0) {
            const optsPerItem = Math.floor(options.length / items.length);
            const subOpts = options.slice(idx * optsPerItem, (idx + 1) * optsPerItem);
            const sliceCorrect = subOpts.find(o => o.is_correct);
            if (sliceCorrect) correctOptionId = sliceCorrect.id;
          }

          // 3. Fallback: JSON metadata (0-based index)
          if (correctOptionId === null && contentData?.questions && contentData.questions[idx]) {
            const jsonQ = contentData.questions[idx];
            let cIdx = jsonQ.correctAnswer;
            if (typeof cIdx === 'string' && /^[A-E]$/i.test(cIdx)) cIdx = cIdx.toUpperCase().charCodeAt(0) - 65;
            if (cIdx !== undefined && cIdx !== null) {
              // Map json index to specific option list
              const itemOptions = item ? options.filter(o => o.item_id === item.id) : options;
              const finalOptions = itemOptions.length > 0 ? itemOptions : options.slice(idx * 3, (idx + 1) * 3);
              if (finalOptions[cIdx]) correctOptionId = finalOptions[cIdx].id;
            }
          }

          if (correctOptionId !== null && correctOptionId !== undefined && parseInt(userAnswerId) === parseInt(correctOptionId)) {
            correctCount++;
          }
        }

        score = total > 0 ? (correctCount / total) * answer.max_score : 0;
      } else {
        // Single MCQ scoring
        let userAnswerId = answer.selected_option_id;

        // Fallback: Check answer_json if selected_option_id is null
        if ((userAnswerId === null || userAnswerId === undefined) && answer.answer_json) {
          try {
            const parsed = typeof answer.answer_json === 'string' ? JSON.parse(answer.answer_json) : answer.answer_json;
            userAnswerId = typeof parsed === 'number' ? parsed : (parsed.selected_option_id !== undefined ? parsed.selected_option_id : (parsed.answer !== undefined ? parsed.answer : parsed.index));
          } catch (e) { }
        }

        const correctOption = options.find(opt => opt.is_correct);
        let isCorrect = (userAnswerId !== null && userAnswerId !== undefined) && correctOption && parseInt(userAnswerId) === parseInt(correctOption.id);

        // JSON Fallback for single MCQ (index based)
        if (!isCorrect && (userAnswerId !== null && userAnswerId !== undefined) && contentData?.correctAnswer !== undefined && contentData?.correctAnswer !== null) {
          const cIdx = contentData.correctAnswer;
          if (options[cIdx] && parseInt(userAnswerId) === parseInt(options[cIdx].id)) {
            isCorrect = true;
          }
        }

        score = isCorrect ? answer.max_score : 0;
      }
    } else if (questionTypeCode.includes('MATCHING')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']]
      });
      const options = await QuestionOption.findAll({
        where: { question_id: question.id },
        order: [['option_order', 'ASC']]
      });

      const correctMapping = {};
      const totalCount = items.length || 1;

      items.forEach((item, idx) => {
        // 1. Direct DB link
        if (item.correct_option_id) {
          correctMapping[item.id] = item.correct_option_id;
          correctMapping[idx] = item.correct_option_id; // Support index based match too
        }

        // 2. JSON Fallback logic (Robust)
        const itemText = (item.item_text || item.content || "").toLowerCase();

        // Case: Speaker Matching (Part 2) - speakers in content.speakers, statements in content.statements
        if (contentData?.statements && Array.isArray(contentData.statements)) {
          const match = contentData.statements.find(s =>
            (s.speaker && s.speaker.toLowerCase().includes(itemText)) ||
            (itemText && itemText.includes(s.speaker?.toLowerCase())) ||
            (s.text && s.text.toLowerCase().includes(itemText)) ||
            (itemText && itemText.includes(s.text?.toLowerCase()))
          );

          if (match) {
            // If we matched by speaker, find option with that text
            const opt = options.find(o =>
              o.option_text === match.text ||
              o.option_text === match.speaker
            );
            if (opt) {
              correctMapping[item.id] = opt.id;
              correctMapping[idx] = opt.id;
            }
          }
        }
      });

      const result = await this.scoreMatching(answer.answer_json, correctMapping, totalCount, items, options);
      score = (result.correct / result.total) * answer.max_score;
    } else if (questionTypeCode.includes('GAP_FILL') || questionTypeCode.includes('FILL')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']],
      });
      // Pass full items array so scoreGapFilling can match by item ID
      const result = await this.scoreGapFilling(answer.answer_json, items);
      score = (result.correct / result.total) * answer.max_score;
    } else if (questionTypeCode.includes('ORDERING')) {
      const items = await QuestionItem.findAll({
        where: { question_id: question.id },
        order: [['item_order', 'ASC']],
      });

      const correctOrderIds = items
        .filter(item => item.answer_text && !isNaN(parseInt(item.answer_text)))
        .sort((a, b) => parseInt(a.answer_text) - parseInt(b.answer_text))
        .map(item => item.id);

      const result = await this.scoreOrdering(answer.answer_json, correctOrderIds);
      score = (result.correct / result.total) * answer.max_score;
    }

    const finalScore = Math.round(Math.min(score, answer.max_score) * 100) / 100;
    console.log(`[ScoringService] Q${question.id} type ${questionTypeCode} score: ${finalScore}/${answer.max_score}`);
    return finalScore;
  }


  async calculateAttemptScore(attemptId) {
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
    });
    let totalScore = 0;
    for (const answer of answers) {
      const answerScore = answer.final_score !== null ? answer.final_score : (answer.score || 0);
      totalScore += parseFloat(answerScore);
    }
    return Math.round(totalScore * 100) / 100;
  }

  async autoGradeAnswer(answerId) {
    const answer = await AttemptAnswer.findByPk(answerId, {
      include: [
        {
          model: require('../models').Question,
          as: 'question',
          include: [{ model: require('../models').QuestionType, as: 'questionType' }],
        },
      ],
    });
    if (!answer || !answer.question) return null;
    const score = await this.scoreAnswer(answer, answer.question);
    if (score !== null) {
      await answer.update({
        score: score,
        auto_graded_at: new Date(),
      });
      return score;
    }
    return null;
  }
}

module.exports = new ScoringService();
