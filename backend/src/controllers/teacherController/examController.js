const {
  Exam,
  ExamSection,
  ExamSectionQuestion,
  AptisType,
  SkillType,
  Question,
  User,
  ExamAttempt,
} = require('../../models');
const { Op } = require('sequelize');
const { paginate, paginationResponse } = require('../../utils/helpers');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const EmailService = require('../../services/EmailService');

/**
 * Create exam
 */
exports.createExam = async (req, res, next) => {
  try {
    const { aptis_type_id, title, description, duration_minutes, total_score } = req.body;
    const teacherId = req.user.userId;

    const exam = await Exam.create({
      aptis_type_id,
      title,
      description: description || null,
      duration_minutes,
      status: 'draft',
      created_by: teacherId,
      total_score: total_score || 0,
    });

    // Fetch the created exam with relationships
    const examWithRelations = await Exam.findByPk(exam.id, {
      include: [
        {
          model: AptisType,
          as: 'aptisType',
          attributes: ['id', 'code', 'aptis_type_name', 'description'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: examWithRelations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update exam
 */
exports.updateExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const updateData = req.body;

    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status === 'published') {
      throw new BadRequestError('Cannot update published exam');
    }

    await exam.update(updateData);

    // Fetch updated exam with relationships
    const updatedExam = await Exam.findByPk(examId, {
      include: [
        {
          model: AptisType,
          as: 'aptisType',
          attributes: ['id', 'code', 'aptis_type_name', 'description'],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedExam,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete exam (only if no attempts have been made)
 */
exports.deleteExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const teacherId = req.user.userId;

    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Check if user is the owner of the exam
    if (exam.created_by !== teacherId) {
      throw new BadRequestError('You do not have permission to delete this exam');
    }

    // Check if exam has any attempts
    const attemptCount = await ExamAttempt.count({
      where: { exam_id: examId }
    });

    if (attemptCount > 0) {
      throw new BadRequestError(`Cannot delete exam because ${attemptCount} student(s) have already taken this exam`);
    }

    // Delete all questions from sections of this exam
    const sections = await ExamSection.findAll({
      where: { exam_id: examId },
      attributes: ['id']
    });

    const sectionIds = sections.map(s => s.id);

    if (sectionIds.length > 0) {
      await ExamSectionQuestion.destroy({
        where: { exam_section_id: { [Op.in]: sectionIds } }
      });
    }

    // Delete all sections
    await ExamSection.destroy({
      where: { exam_id: examId }
    });

    // Delete the exam itself
    await exam.destroy();

    res.json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add section to exam
 */
exports.addSection = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { skill_type_id, section_order, duration_minutes, instruction } = req.body;

    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status !== 'draft') {
      throw new BadRequestError('Cannot modify published exam');
    }

    const section = await ExamSection.create({
      exam_id: examId,
      skill_type_id,
      section_order,
      duration_minutes: duration_minutes || null,
      instruction: instruction || null,
    });

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update section
 */
exports.updateSection = async (req, res, next) => {
  try {
    const { examId, sectionId } = req.params;
    const { skill_type_id, duration_minutes, instruction } = req.body;

    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status !== 'draft') {
      throw new BadRequestError('Cannot modify published exam');
    }

    const section = await ExamSection.findOne({
      where: { id: sectionId, exam_id: examId },
    });

    if (!section) {
      throw new NotFoundError('Section not found');
    }

    await section.update({
      skill_type_id: skill_type_id || section.skill_type_id,
      duration_minutes: duration_minutes || section.duration_minutes,
      instruction: instruction !== undefined ? instruction : section.instruction,
    });

    // Fetch updated section with relationships
    const updatedSection = await ExamSection.findByPk(sectionId, {
      include: [
        {
          model: SkillType,
          as: 'skillType',
          attributes: ['id', 'code', 'skill_type_name'],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedSection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add question to section
 */
exports.addQuestionToSection = async (req, res, next) => {
  try {
    const { examId, sectionId } = req.params;
    const { question_id, question_order, max_score } = req.body;

    const section = await ExamSection.findOne({
      where: { id: sectionId, exam_id: examId },
    });

    if (!section) {
      throw new NotFoundError('Section not found');
    }

    const question = await Question.findByPk(question_id);
    if (!question) {
      throw new NotFoundError('Question not found');
    }

    const esq = await ExamSectionQuestion.create({
      exam_section_id: sectionId,
      question_id,
      question_order,
      max_score,
    });

    // Update total score
    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: ExamSection,
          as: 'sections',
          include: [
            {
              model: ExamSectionQuestion,
              as: 'questions',
            },
          ],
        },
      ],
    });

    const totalScore = exam.sections.reduce(
      (sum, sec) => sum + sec.questions.reduce((s, q) => s + parseFloat(q.max_score), 0),
      0,
    );

    await exam.update({ total_score: totalScore });

    res.status(201).json({
      success: true,
      data: esq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove question from section
 */
exports.removeQuestionFromSection = async (req, res, next) => {
  try {
    const { examId, sectionId, questionId } = req.params;

    const exam = await Exam.findByPk(examId);
    if (!exam || exam.status !== 'draft') {
      throw new BadRequestError('Cannot modify published exam');
    }

    const esq = await ExamSectionQuestion.findOne({
      where: {
        exam_section_id: sectionId,
        question_id: questionId,
      },
    });

    if (!esq) {
      throw new NotFoundError('Question not found in section');
    }

    await esq.destroy();

    res.json({
      success: true,
      message: 'Question removed from section',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update question order in section (for drag-drop reordering)
 */
exports.updateQuestionInSection = async (req, res, next) => {
  try {
    const { examId, sectionId, questionId } = req.params;
    const { order_index, points } = req.body;

    const exam = await Exam.findByPk(examId);
    if (!exam || exam.status !== 'draft') {
      throw new BadRequestError('Cannot modify published exam');
    }

    const esq = await ExamSectionQuestion.findOne({
      where: {
        exam_section_id: sectionId,
        question_id: questionId,
      },
    });

    if (!esq) {
      throw new NotFoundError('Question not found in section');
    }

    // Update order_index and/or points if provided
    if (order_index !== undefined) {
      esq.order_index = order_index;
    }
    if (points !== undefined) {
      esq.points = points;
    }

    await esq.save();

    res.json({
      success: true,
      message: 'Question updated in section',
      data: esq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish exam
 */
exports.publishExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { notify_students = false } = req.body;

    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: ExamSection,
          as: 'sections',
          include: [
            {
              model: ExamSectionQuestion,
              as: 'questions',
            },
          ],
        },
      ],
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status === 'published') {
      throw new BadRequestError('Exam already published');
    }

    // Validate exam has sections and questions
    if (!exam.sections || exam.sections.length === 0) {
      throw new BadRequestError('Exam must have at least one section');
    }

    for (const section of exam.sections) {
      if (!section.questions || section.questions.length === 0) {
        throw new BadRequestError('All sections must have at least one question');
      }
    }

    await exam.update({
      status: 'published',
      published_at: new Date(),
    });

    // Send notification emails if requested
    if (notify_students) {
      const students = await User.findAll({
        where: { role: 'student', status: 'active' },
      });

      const emailPromises = students.map((student) =>
        EmailService.sendExamPublishedEmail(student.email, student.full_name, exam),
      );

      await Promise.allSettled(emailPromises);
    }

    res.json({
      success: true,
      data: exam,
      message: 'Exam published successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get teacher's exams
 */
exports.getMyExams = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      aptis_type,
      skill,
      search 
    } = req.query;
    const { offset, limit: validLimit } = paginate(page, limit);
    const teacherId = req.user.userId;

    console.log('[getMyExams] Query params:', { page, limit, status, aptis_type, skill, search, teacherId });

    const where = { created_by: teacherId };
    
    // Status filter
    if (status && status !== 'undefined') {
      where.status = status;
      console.log('[getMyExams] Applied status filter:', status);
    }
    
    // APTIS type filter - FIX: ensure it's not string 'undefined' or empty
    if (aptis_type && aptis_type !== 'undefined' && aptis_type !== '') {
      where.aptis_type_id = parseInt(aptis_type);
      console.log('[getMyExams] Applied aptis_type_id filter:', parseInt(aptis_type));
    }
    
    // Search filter
    if (search && search !== 'undefined' && search !== '') {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
      console.log('[getMyExams] Applied search filter:', search);
    }

    // Build include array
    const include = [
      {
        model: AptisType,
        as: 'aptisType',
        attributes: ['id', 'code', 'aptis_type_name'],
      },
      {
        model: ExamSection,
        as: 'sections',
        attributes: ['id', 'skill_type_id'],
        include: [
          {
            model: SkillType,
            as: 'skillType',
            attributes: ['id', 'skill_type_name', 'code']
          }
        ]
      },
    ];

    // If skill filter is applied, filter by related SkillType
    if (skill && skill !== 'undefined' && skill !== '') {
      include[1].where = { skill_type_id: parseInt(skill) };
      include[1].required = true; // INNER JOIN
      console.log('[getMyExams] Applied skill filter:', parseInt(skill));
    }

    console.log('[getMyExams] Final where clause:', where);

    const { count, rows } = await Exam.findAndCountAll({
      where,
      include,
      offset,
      limit: validLimit,
      order: [['created_at', 'DESC']],
      distinct: true, // Important for counting with joins
    });

    // Get attempt counts for each exam
    const examIds = rows.map(exam => exam.id);
    const attemptCounts = await ExamAttempt.findAll({
      attributes: [
        'exam_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { exam_id: { [Op.in]: examIds } },
      group: ['exam_id'],
      raw: true
    });

    const attemptCountMap = {};
    attemptCounts.forEach(item => {
      attemptCountMap[item.exam_id] = parseInt(item.count);
    });

    // Transform data to match frontend expectations
    const transformedRows = rows.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description || '',
      aptis_type: exam.aptisType?.aptis_type_name || 'Unknown',
      aptis_type_id: exam.aptis_type_id,
      aptisType: exam.aptisType, // Return the full object for DeleteExamDialog
      duration_minutes: exam.duration_minutes || 0,
      total_score: exam.total_score || 0,
      status: exam.status,
      is_published: exam.status === 'published',
      attempt_count: attemptCountMap[exam.id] || 0, // Number of students who took this exam
      total_sections: exam.sections?.length || 0,
      total_questions: 0, // Calculate this from sections if needed
      created_at: exam.created_at,
      updated_at: exam.updated_at,
      published_at: exam.published_at,
    }));

    res.json({
      success: true,
      ...paginationResponse(transformedRows, parseInt(page), validLimit, count),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unpublish exam
 */
exports.unpublishExam = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findByPk(examId);

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.status !== 'published') {
      throw new BadRequestError('Exam is not published');
    }

    await exam.update({
      status: 'draft',
      published_at: null,
    });

    res.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove section from exam
 */
exports.removeSection = async (req, res, next) => {
  try {
    const { examId, sectionId } = req.params;

    const exam = await Exam.findByPk(examId);
    if (!exam || exam.status !== 'draft') {
      throw new BadRequestError('Cannot modify published exam');
    }

    const section = await ExamSection.findOne({
      where: { id: sectionId, exam_id: examId },
    });

    if (!section) {
      throw new NotFoundError('Section not found');
    }

    // Remove all questions from section first
    await ExamSectionQuestion.destroy({
      where: { exam_section_id: sectionId },
    });

    // Remove the section
    await section.destroy();

    res.json({
      success: true,
      message: 'Section removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exam by ID (for detailed view)
 */
exports.getExamById = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: AptisType,
          as: 'aptisType',
          attributes: ['id', 'code', 'aptis_type_name'],
        },
        {
          model: ExamSection,
          as: 'sections',
          include: [
            {
              model: SkillType,
              as: 'skillType',
              attributes: ['id', 'code', 'skill_type_name'],
            },
            {
              model: ExamSectionQuestion,
              as: 'questions',
              include: [
                {
                  model: Question,
                  as: 'question',
                  attributes: ['id', 'content', 'question_type_id', 'difficulty'],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name'],
        },
      ],
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    res.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};
