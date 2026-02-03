const {
  Question,
  QuestionType,
  SkillType,
  AptisType,
  QuestionItem,
  QuestionOption,
  ExamSectionQuestion,
} = require('../../models');
const { paginate, paginationResponse } = require('../../utils/helpers');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const { DIFFICULTY_LEVELS, QUESTION_STATUS } = require('../../utils/constants');
const { Op } = require('sequelize');
const StorageService = require('../../services/StorageService');

/**
 * Create items and options from parsed JSON content based on question type
 */
async function createItemsAndOptionsFromContent(questionId, questionTypeCode, parsedContent) {
  switch (questionTypeCode) {
    // Reading question types
    case 'READING_GAP_FILL':
      await createGapFillingItemsAndOptions(questionId, parsedContent);
      break;
    case 'READING_ORDERING':
      await createOrderingItems(questionId, parsedContent);
      break;
    case 'READING_MATCHING':
      await createMatchingItemsAndOptions(questionId, parsedContent);
      break;
    case 'READING_MATCHING_HEADINGS':
      await createMatchingHeadingsItemsAndOptions(questionId, parsedContent);
      break;
    case 'READING_SHORT_TEXT':
      await createShortTextMatchingItemsAndOptions(questionId, parsedContent);
      break;

    // Listening question types
    case 'LISTENING_MCQ':
    case 'LISTENING_MCQ_MULTI':
      await createListeningMCQItemsAndOptions(questionId, parsedContent);
      break;
    case 'LISTENING_MATCHING':
      await createListeningMatchingItemsAndOptions(questionId, parsedContent);
      break;
    case 'LISTENING_STATEMENT_MATCHING':
      await createListeningStatementMatchingItemsAndOptions(questionId, parsedContent);
      break;

    default:
      console.log(`No auto-generation logic for question type: ${questionTypeCode}`);
      break;
  }
}

/**
 * Gap Filling: Create options and items with correct answers
 */
async function createGapFillingItemsAndOptions(questionId, data) {
  const { options = [], correctAnswers = [] } = data;

  // Create options
  for (let i = 0; i < options.length; i++) {
    await QuestionOption.create({
      question_id: questionId,
      item_id: null,
      option_text: options[i],
      option_order: i + 1,
      is_correct: false,
    });
  }

  // Create gap items with correct answers
  for (let i = 0; i < correctAnswers.length; i++) {
    await QuestionItem.create({
      question_id: questionId,
      item_text: `[GAP${i + 1}]`,
      item_number: i + 1,
      item_order: i + 1,
      answer_text: correctAnswers[i],
    });
  }
}

/**
 * Ordering: Create items with correct order
 */
async function createOrderingItems(questionId, data) {
  const { sentences = [], correctOrder = [] } = data;

  // Shuffle sentences for random display order
  const shuffled = sentences
    .map((s, idx) => ({ text: s, originalIdx: idx + 1 }))
    .sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length; i++) {
    const correctPosition = correctOrder[shuffled[i].originalIdx - 1];

    await QuestionItem.create({
      question_id: questionId,
      item_text: `${shuffled[i].originalIdx}. ${shuffled[i].text}`,
      item_order: i + 1, // Display order (random)
      answer_text: `${correctPosition}`, // Correct position
    });
  }
}

/**
 * Matching: Create options and items for person-question matching
 */
async function createMatchingItemsAndOptions(questionId, data) {
  const { questions = [], persons = [] } = data;
  console.log(`[createMatching] Starting for Q ${questionId}`);

  // Create person options
  const optionMap = {};
  for (let i = 0; i < persons.length; i++) {
    const person = persons[i];
    const personName = String(person.name || person || `Person ${String.fromCharCode(65 + i)}`);
    console.log(`  - Creating option: "${personName}"`);
    const option = await QuestionOption.create({
      question_id: questionId,
      item_id: null,
      option_text: personName,
      option_order: i + 1,
      is_correct: false,
    });
    optionMap[personName] = option.id;
  }

  // Create question items
  for (let i = 0; i < questions.length; i++) {
    const questionItem = questions[i];
    const itemText = String(questionItem.text || questionItem || "");
    const correctAnswer = String(questionItem.correct || "");
    console.log(`  - Creating item: "${itemText}", Ans: "${correctAnswer}"`);
    await QuestionItem.create({
      question_id: questionId,
      item_text: itemText,
      item_order: i + 1,
      answer_text: correctAnswer,
      correct_option_id: optionMap[correctAnswer],
    });
  }
}

/**
 * Matching Headings: Create heading options and paragraph items
 */
async function createMatchingHeadingsItemsAndOptions(questionId, data) {
  const { headingOptions = [], passages = [] } = data;

  // Create heading options
  const headingOptionMap = {};
  for (let i = 0; i < headingOptions.length; i++) {
    const option = await QuestionOption.create({
      question_id: questionId,
      item_id: null,
      option_text: headingOptions[i],
      option_order: i + 1,
      is_correct: false,
    });
    headingOptionMap[headingOptions[i]] = option.id;
  }

  // Create paragraph items
  for (let i = 0; i < passages.length; i++) {
    const passage = passages[i];
    await QuestionItem.create({
      question_id: questionId,
      item_text: `Paragraph ${i + 1}`,
      item_order: i + 1,
      answer_text: passage.heading,
      correct_option_id: headingOptionMap[passage.heading],
    });
  }
}

/**
 * Short Text Matching: Create description options and text items
 */
async function createShortTextMatchingItemsAndOptions(questionId, data) {
  const { descriptions = [], short_texts = [], correct_matches = {} } = data;

  // Create description options
  const descriptionOptionMap = {};
  for (let i = 0; i < descriptions.length; i++) {
    const desc = descriptions[i];
    const option = await QuestionOption.create({
      question_id: questionId,
      item_id: null,
      option_text: desc.description,
      option_order: i + 1,
      is_correct: false,
    });
    descriptionOptionMap[desc.letter] = option.id;
  }

  // Create short text items
  for (let i = 0; i < short_texts.length; i++) {
    const text = short_texts[i];
    const correctLetter = correct_matches[text.id] || correct_matches[i + 1];

    await QuestionItem.create({
      question_id: questionId,
      item_text: text.text,
      item_order: i + 1,
      answer_text: correctLetter,
      correct_option_id: descriptionOptionMap[correctLetter],
    });
  }
}

/**
 * Listening MCQ: Create questions and options (can be single or multiple choice)
 */
async function createListeningMCQItemsAndOptions(questionId, data) {
  const { questions = [], isMultiple = false } = data;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const itemText = String(question.question || question.text || "");

    // Create question item
    const item = await QuestionItem.create({
      question_id: questionId,
      item_text: itemText,
      item_order: i + 1,
      answer_text: null,
      correct_option_id: null,
    });

    // Create options for this question
    for (let j = 0; j < question.options.length; j++) {
      const option = question.options[j];
      const optionText = String(option.text || option || "");
      const isCorrect = isMultiple ? option.correct : (j === question.correctAnswer);

      await QuestionOption.create({
        question_id: questionId,
        item_id: item.id,
        option_text: optionText,
        option_order: j + 1,
        is_correct: isCorrect,
      });
    }
  }
}

/**
 * Listening Matching: Create speaker-statement pairs 
 */
async function createListeningMatchingItemsAndOptions(questionId, data) {
  const { speakers = [], statements = [] } = data;
  console.log(`[createListeningMatching] 🛠️ GENERATING for Q ${questionId}`);

  // 1. Create statement options (Right column - what speakers say)
  const statementOptionMap = {};
  for (let i = 0; i < statements.length; i++) {
    const rawStatement = statements[i];
    const statementText = String((typeof rawStatement === 'object' ? (rawStatement.text || rawStatement.statement) : rawStatement) || "");

    console.log(`  - Adding Option Text: "${statementText}"`);

    const option = await QuestionOption.create({
      question_id: questionId,
      item_id: null,
      option_text: statementText,
      option_order: i + 1,
      is_correct: false,
    });
    // Map text to ID for matching later
    statementOptionMap[statementText] = option.id;
  }

  // 2. Create speaker items (Left column - the people speaking)
  for (let i = 0; i < speakers.length; i++) {
    const speaker = speakers[i];
    const speakerName = String((typeof speaker === 'object' ? speaker.name : speaker) || "");

    // Find matching statement to set correct answer
    const matchingStatement = statements.find(s => s.speaker === speakerName);
    const correctStatementText = matchingStatement ? String(matchingStatement.text || matchingStatement.statement || "") : "";
    const correctOptionId = matchingStatement ? statementOptionMap[correctStatementText] : null;

    console.log(`  - Adding Speaker Item: "${speakerName}", Correct Option ID: ${correctOptionId}`);

    await QuestionItem.create({
      question_id: questionId,
      item_text: speakerName,
      item_order: i + 1,
      answer_text: correctStatementText || null,
      correct_option_id: correctOptionId,
      media_url: speaker.audioUrl ? String(speaker.audioUrl) : null
    });
  }
}

/**
 * Listening Statement Matching: Create statements with correct speakers
 */
async function createListeningStatementMatchingItemsAndOptions(questionId, data) {
  const { speakers = [], statements = [] } = data;

  // Create speaker options (Man, Woman, Both, etc.)
  const speakerOptionMap = {};
  for (let i = 0; i < speakers.length; i++) {
    const speaker = speakers[i];
    const speakerName = String((typeof speaker === 'object' ? speaker.name : speaker) || "");

    const option = await QuestionOption.create({
      question_id: questionId,
      item_id: null,
      option_text: speakerName,
      option_order: i + 1,
      is_correct: false,
    });
    speakerOptionMap[speakerName] = option.id;
  }

  // Create statement items linked to correct speaker
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const statementText = String(statement.text || statement || "");
    const correctSpeaker = String(statement.speaker || "");

    await QuestionItem.create({
      question_id: questionId,
      item_text: statementText,
      item_order: i + 1,
      answer_text: correctSpeaker || null,
      correct_option_id: speakerOptionMap[correctSpeaker] || null,
    });
  }
}

exports.createQuestion = async (req, res, next) => {
  try {
    const {
      question_type_id,
      aptis_type_id,
      difficulty,
      content,
      media_url,
      duration_seconds,
      parent_question_id,
      additional_media,
      items,
      options,
      sample_answer,
    } = req.body;

    const teacherId = req.user.userId;

    console.log('[createQuestion] 📥 Request Body keys:', Object.keys(req.body));
    console.log('[createQuestion] 📥 Has manual options?', !!(req.body.options && req.body.options.length > 0));
    console.log('[createQuestion] 📥 Has manual items?', !!(req.body.items && req.body.items.length > 0));
    console.log('[createQuestion] 👤 Teacher ID:', teacherId);

    const question = await Question.create({
      question_type_id,
      aptis_type_id,
      difficulty,
      content,
      media_url: media_url || null,
      duration_seconds: duration_seconds || null,
      parent_question_id: parent_question_id || null,
      additional_media: additional_media || null,
      created_by: teacherId,
      status: 'draft',
    });

    // Parse JSON content to create items and options
    let parsedContent = null;
    if (content) {
      if (typeof content === 'string') {
        try {
          parsedContent = JSON.parse(content);
        } catch (error) {
          console.warn('[createQuestion] Content is string but not valid JSON');
        }
      } else if (typeof content === 'object') {
        parsedContent = content;
      }
    }

    // Auto-generate items and options based on question type and content
    if (parsedContent) {
      console.log('[createQuestion] 🛠️ Auto-generating items for code:', parsedContent.type);
      const questionType = await QuestionType.findByPk(question_type_id);
      await createItemsAndOptionsFromContent(question.id, questionType?.code, parsedContent);
    }

    // Create manual items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await QuestionItem.create({
          question_id: question.id,
          item_text: item.item_text,
          item_order: item.item_order,
          answer_text: item.answer_text || null,
          correct_option_id: item.correct_option_id || null,
        });
      }
    }

    // Create manual options if provided
    if (options && options.length > 0) {
      console.log('[createQuestion] 🏷️ Creating manual options:', options.length);
      for (const option of options) {
        await QuestionOption.create({
          question_id: question.id,
          item_id: option.item_id || null,
          option_text: String(option.option_text || ""),
          option_order: option.option_order || null,
          is_correct: !!option.is_correct,
        });
      }
    }

    const fullQuestion = await Question.findByPk(question.id, {
      include: [
        { model: QuestionType, as: 'questionType' },
        { model: AptisType, as: 'aptisType' },
        { model: QuestionItem, as: 'items' },
        { model: QuestionOption, as: 'options' },
      ],
    });

    console.log('[createQuestion] ✅ Question created successfully:');
    console.log('  - ID:', question.id);
    console.log('  - parent_question_id:', question.parent_question_id);
    console.log('  - Response structure:', {
      success: true,
      data: fullQuestion,
      questionId: question.id
    });

    res.status(201).json({
      success: true,
      data: fullQuestion,
      questionId: question.id, // Trả về question ID
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadQuestionImages = async (req, res, next) => {
  try {
    console.log('📸 Upload images endpoint called');
    console.log('Question ID:', req.params.questionId);
    console.log('Files received:', req.files ? req.files.length : 0);

    const { questionId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      console.error('❌ No files in request');
      throw new BadRequestError('No images provided');
    }

    // Find question
    const question = await Question.findByPk(questionId);
    if (!question) {
      console.error('❌ Question not found:', questionId);
      throw new NotFoundError('Question not found');
    }

    console.log('📁 Files to process:', files.map(f => ({
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype
    })));

    // Build additional_media array
    const additionalMedia = files.map((file, index) => ({
      type: 'image',
      description: files.length > 1 ? `Image ${String.fromCharCode(65 + index)}` : 'Main image',
      url: `/uploads/questions/${file.filename}`,
    }));

    // Update question with additional_media
    await question.update({
      additional_media: JSON.stringify(additionalMedia),
    });

    console.log('✅ Images uploaded and saved:', additionalMedia);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        questionId: question.id,
        additional_media: additionalMedia,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    next(error);
  }
};

exports.uploadQuestionAudios = async (req, res, next) => {
  try {
    console.log('🎧 Upload audios endpoint called');
    console.log('Question ID:', req.params.questionId);
    console.log('Files received:', req.files);

    const { questionId } = req.params;
    const { mainAudio, speakerAudios } = req.files || {};

    if (!mainAudio && !speakerAudios) {
      console.error('❌ No audio files in request');
      throw new BadRequestError('No audio files provided');
    }

    // Find question
    const question = await Question.findByPk(questionId);
    if (!question) {
      console.error('❌ Question not found:', questionId);
      throw new NotFoundError('Question not found');
    }

    const audioData = {};

    // Process main audio
    if (mainAudio && mainAudio[0]) {
      audioData.mainAudioUrl = `/uploads/audio/${mainAudio[0].filename}`;
      console.log('📁 Main audio processed:', audioData.mainAudioUrl);
    }

    // Process speaker audios
    if (speakerAudios && speakerAudios.length > 0) {
      audioData.speakerAudioUrls = speakerAudios.map(file =>
        `/uploads/audio/${file.filename}`
      );
      console.log('📁 Speaker audios processed:', audioData.speakerAudioUrls);
    }

    // Update question content with audio URLs
    let updatedContent = {};
    try {
      if (question.content) {
        updatedContent = JSON.parse(question.content);
      }
    } catch (error) {
      console.warn('Question content is not valid JSON, creating new structure');
    }

    // Update URLs in content
    if (audioData.mainAudioUrl) {
      updatedContent.audioUrl = audioData.mainAudioUrl;
      // Also update media_url for main audio
      await question.update({ media_url: audioData.mainAudioUrl });
    }

    if (audioData.speakerAudioUrls) {
      // Update speakers with their audio URLs
      if (updatedContent.speakers && Array.isArray(updatedContent.speakers)) {
        updatedContent.speakers = updatedContent.speakers.map((speaker, index) => {
          // If speaker is a string, convert to object
          const speakerObj = typeof speaker === 'object' ? { ...speaker } : { name: speaker };

          return {
            ...speakerObj,
            audioUrl: audioData.speakerAudioUrls[index] || speakerObj.audioUrl
          };
        });
      }
    }

    // Update question with new content containing audio URLs
    await question.update({
      content: JSON.stringify(updatedContent)
    });

    console.log('✅ Audios uploaded and question updated:', audioData);

    res.status(200).json({
      success: true,
      message: 'Audio files uploaded successfully',
      data: {
        questionId: question.id,
        audioData: audioData,
      },
    });
  } catch (error) {
    console.error('❌ Audio upload error:', error);
    next(error);
  }
};

exports.getQuestions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      question_type_id,
      question_type_code,
      aptis_type_id,
      skill_type_id,
      difficulty,
      status,
      search,
    } = req.query;

    console.log('[questionController.getQuestions] Received params:', {
      page, limit, question_type_id, question_type_code, aptis_type_id, skill_type_id, difficulty, status, search
    });

    const { offset, limit: validLimit } = paginate(page, limit);


    const where = {
      parent_question_id: null // Only fetch root/parent questions by default
    };

    if (question_type_id) {
      where.question_type_id = question_type_id;
      console.log('[questionController] Filtering by question_type_id:', question_type_id);
    }
    if (aptis_type_id) {
      where.aptis_type_id = aptis_type_id;
      console.log('[questionController] Filtering by aptis_type_id:', aptis_type_id);
    }
    if (difficulty) {
      where.difficulty = difficulty;
      console.log('[questionController] Filtering by difficulty:', difficulty);
    }
    if (status) {
      where.status = status;
      console.log('[questionController] Filtering by status:', status);
    }
    if (search) {
      where.content = { [Op.like]: `%${search}%` };
      console.log('[questionController] Filtering by search:', search);
    }

    let finalWhere = where;

    // Usage status filter
    const { used_status } = req.query;
    if (used_status === 'unused') {
      finalWhere.id = {
        [Op.notIn]: require('sequelize').literal('(SELECT DISTINCT question_id FROM exam_section_questions)')
      };
      console.log('[questionController] Filtering by unused status');
    } else if (used_status === 'used') {
      finalWhere.id = {
        [Op.in]: require('sequelize').literal('(SELECT DISTINCT question_id FROM exam_section_questions)')
      };
      console.log('[questionController] Filtering by used status');
    }

    const include = [
      {
        model: QuestionType,
        as: 'questionType',
        attributes: ['id', 'question_type_name', 'code'],
        include: [
          {
            model: SkillType,
            as: 'skillType',
            attributes: ['id', 'skill_type_name', 'code']
          }
        ]
      },
      { model: AptisType, as: 'aptisType', attributes: ['id', 'aptis_type_name', 'code'] },
      {
        model: Question,
        as: 'childQuestions',
        attributes: ['id', 'content', 'question_type_id', 'difficulty'],
        required: false
      }
    ];

    if (skill_type_id) {
      include[0].where = { skill_type_id: skill_type_id };
      include[0].required = true; // INNER JOIN to enforce the filter
    }

    // Handle question_type_code filter
    if (question_type_code) {
      if (include[0].where) {
        include[0].where.code = question_type_code;
      } else {
        include[0].where = { code: question_type_code };
        include[0].required = true; // INNER JOIN to enforce the filter
      }
      console.log('[questionController] Filtering by question_type_code:', question_type_code);
    }


    const { count, rows } = await Question.findAndCountAll({
      where: finalWhere,
      include,
      offset,
      limit: validLimit,
      order: [['created_at', 'DESC']],
      raw: false,
      distinct: true, // Important for counting with joins
      subQuery: false, // Fix: Prevent subquery alias issues when filtering by related models (skill_type)
    });

    const transformedRows = await Promise.all(rows.map(async (question) => {
      // Get count of exams this question is used in
      const usageCount = await ExamSectionQuestion.count({
        where: { question_id: question.id }
      });

      return {
        id: question.id,
        title: question.content?.substring(0, 100) || 'Untitled Question',
        description: question.content?.substring(0, 200) || '',
        content: question.content,
        question_type: question.questionType?.question_type_name || 'Unknown',
        question_type_code: question.questionType?.code,
        questionType: question.questionType,
        question_type_id: question.question_type_id,
        skill: question.questionType?.skillType?.skill_type_name || 'General',
        skill_id: question.questionType?.skillType?.id,
        difficulty: question.difficulty,
        aptis_type: question.aptisType?.aptis_type_name || 'Unknown',
        aptis_type_id: question.aptis_type_id,
        media_url: question.media_url,
        duration_seconds: question.duration_seconds,
        status: question.status,
        usage_count: usageCount,
        is_used_in_exam: usageCount > 0,
        childQuestions: question.childQuestions, // Include child questions
        created_at: question.created_at,
        updated_at: question.updated_at,
      };
    }));

    res.json({
      success: true,
      data: transformedRows,
      page: parseInt(page),
      limit: validLimit,
      total: count,
      totalPages: Math.ceil(count / validLimit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionDetails = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId, {
      include: [
        { model: QuestionType, as: 'questionType' },
        { model: AptisType, as: 'aptisType' },
        { model: QuestionItem, as: 'items' },
        { model: QuestionOption, as: 'options' },
      ],
    });

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;

    const question = await Question.findByPk(questionId);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    const usage = await ExamSectionQuestion.count({
      where: { question_id: questionId },
    });

    if (usage > 0 && question.status === 'active') {
      throw new BadRequestError('Cannot update question that is used in active exams');
    }

    await question.update(updateData);

    res.json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// Update only media URL for a question
exports.updateQuestionMediaUrl = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { media_url } = req.body;

    const question = await Question.findByPk(questionId);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    await question.update({ media_url });

    res.json({
      success: true,
      data: { id: question.id, media_url: question.media_url },
      message: 'Media URL updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findByPk(questionId);

    if (!question) {
      throw new NotFoundError('Question not found');
    }

    const usage = await ExamSectionQuestion.count({
      where: { question_id: questionId },
    });

    if (usage > 0) {
      throw new BadRequestError('Cannot delete question that is used in exams');
    }

    // Check if this question is a child question (has a parent)
    if (question.parent_question_id) {
      // This is a child question, just delete it directly
      if (question.media_url) {
        await StorageService.deleteFile(question.media_url);
      }

      // Xóa tất cả question dependencies (cascade)
      await Promise.all([
        require('../../models').AttemptAnswer.destroy({ where: { question_id: questionId } }),
        require('../../models').QuestionItem.destroy({ where: { question_id: questionId } }),
        require('../../models').QuestionOption.destroy({ where: { question_id: questionId } })
      ]);

      await question.destroy();
    } else {
      // This is a parent question, cascade delete all child questions
      const childQuestions = await Question.findAll({
        where: { parent_question_id: questionId }
      });

      console.log(`[deleteQuestion] Deleting parent question ${questionId} with ${childQuestions.length} child questions`);

      // Delete child questions with dependencies
      for (const childQuestion of childQuestions) {
        // Check if child is used in exams
        const childUsage = await ExamSectionQuestion.count({
          where: { question_id: childQuestion.id },
        });

        if (childUsage > 0) {
          throw new BadRequestError(`Cannot delete question because child question (ID: ${childQuestion.id}) is used in exams`);
        }

        // Delete child question media
        if (childQuestion.media_url) {
          await StorageService.deleteFile(childQuestion.media_url);
        }

        // Delete child question dependencies
        await Promise.all([
          require('../../models').AttemptAnswer.destroy({ where: { question_id: childQuestion.id } }),
          require('../../models').QuestionItem.destroy({ where: { question_id: childQuestion.id } }),
          require('../../models').QuestionOption.destroy({ where: { question_id: childQuestion.id } })
        ]);

        // Delete child question
        await childQuestion.destroy();
        console.log(`[deleteQuestion] Deleted child question ${childQuestion.id}`);
      }

      // Delete parent question media
      if (question.media_url) {
        await StorageService.deleteFile(question.media_url);
      }

      // Delete parent question dependencies
      await Promise.all([
        require('../../models').AttemptAnswer.destroy({ where: { question_id: questionId } }),
        require('../../models').QuestionItem.destroy({ where: { question_id: questionId } }),
        require('../../models').QuestionOption.destroy({ where: { question_id: questionId } })
      ]);

      // Delete parent question
      await question.destroy();
      console.log(`[deleteQuestion] Deleted parent question ${questionId}`);
    }

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionUsage = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const { ExamSection, Exam } = require('../../models');
    const usage = await ExamSectionQuestion.findAll({
      where: { question_id: questionId },
      include: [
        {
          model: ExamSection,
          as: 'examSection',
          include: [
            {
              model: Exam,
              as: 'exam',
              attributes: ['id', 'title', 'status'],
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFilterOptions = async (req, res, next) => {
  try {
    const questionTypes = await QuestionType.findAll({
      attributes: ['id', 'question_type_name', 'code'],
      order: [['question_type_name', 'ASC']],
    });

    const aptisTypes = await AptisType.findAll({
      attributes: ['id', 'aptis_type_name', 'code'],
      order: [['aptis_type_name', 'ASC']],
    });

    const skillTypes = await SkillType.findAll({
      attributes: ['id', 'skill_type_name', 'code'],
      order: [['display_order', 'ASC']],
    });

    const difficulties = [
      { value: DIFFICULTY_LEVELS.EASY, label: 'Dễ' },
      { value: DIFFICULTY_LEVELS.MEDIUM, label: 'Trung bình' },
      { value: DIFFICULTY_LEVELS.HARD, label: 'Khó' }
    ];

    const statuses = [
      { value: QUESTION_STATUS.DRAFT, label: 'Bản nháp' },
      { value: QUESTION_STATUS.ACTIVE, label: 'Hoạt động' },
      { value: QUESTION_STATUS.INACTIVE, label: 'Không hoạt động' }
    ];

    const filterOptions = {
      aptisTypes: aptisTypes.map(type => ({
        id: type.id,
        label: type.aptis_type_name
      })),
      questionTypes: questionTypes.map(type => ({
        id: type.id,
        label: type.question_type_name
      })),
      skills: skillTypes.map(skill => ({
        id: skill.id,
        label: skill.skill_type_name
      })),
      difficulties,
      statuses
    };

    res.json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    next(error);
  }
};
