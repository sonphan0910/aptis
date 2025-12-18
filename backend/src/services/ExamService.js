const { Exam, ExamSection, Question } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError, BusinessLogicError } = require('../utils/errors');
const { paginate, generateCode } = require('../utils/helpers');

/**
 * Exam Service
 * Handles exam management operations
 */
class ExamService {
  /**
   * Create new exam
   */
  static async createExam(examData, createdBy) {
    const {
      title,
      description,
      exam_type,
      duration_minutes,
      max_attempts,
      pass_threshold,
      instructions,
      settings,
    } = examData;

    // Generate unique exam code
    const exam_code = await this.generateExamCode();

    const exam = await Exam.create({
      title,
      description,
      exam_code,
      exam_type,
      duration_minutes,
      max_attempts,
      pass_threshold,
      instructions,
      settings: JSON.stringify(settings || {}),
      created_by: createdBy,
      status: 'draft',
    });

    return this.getExamById(exam.id);
  }

  /**
   * Get exam by ID
   */
  static async getExamById(examId) {
    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: ExamSection,
          as: 'sections',
          include: [
            {
              model: Question,
              as: 'questions',
            },
          ],
        },
      ],
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Parse settings JSON
    if (exam.settings) {
      try {
        exam.settings = JSON.parse(exam.settings);
      } catch (e) {
        exam.settings = {};
      }
    }

    return exam;
  }

  /**
   * Update exam
   */
  static async updateExam(examId, updateData, updatedBy) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Only allow certain fields to be updated
    const allowedFields = [
      'title',
      'description',
      'exam_type',
      'duration_minutes',
      'max_attempts',
      'pass_threshold',
      'instructions',
      'settings',
      'status',
    ];

    const filteredData = { updated_by: updatedBy };

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === 'settings' && typeof updateData[field] === 'object') {
          filteredData[field] = JSON.stringify(updateData[field]);
        } else {
          filteredData[field] = updateData[field];
        }
      }
    });

    await exam.update(filteredData);
    return this.getExamById(examId);
  }

  /**
   * Delete exam
   */
  static async deleteExam(examId) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Check if exam has any attempts
    const attemptCount = await exam.countAttempts();
    if (attemptCount > 0) {
      throw new BusinessLogicError('Cannot delete exam with existing attempts');
    }

    await exam.destroy();
    return true;
  }

  /**
   * Get all exams with filtering and pagination
   */
  static async getAllExams({ page = 1, limit = 20, exam_type, status, created_by, search }) {
    const { offset, limit: validLimit } = paginate(page, limit);

    const where = {};

    if (exam_type) {
      where.exam_type = exam_type;
    }

    if (status) {
      where.status = status;
    }

    if (created_by) {
      where.created_by = created_by;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { exam_code: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Exam.findAndCountAll({
      where,
      offset,
      limit: validLimit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: ExamSection,
          as: 'sections',
          attributes: ['id', 'title'],
        },
      ],
    });

    return {
      exams: rows,
      pagination: {
        page: parseInt(page),
        limit: validLimit,
        total: count,
        pages: Math.ceil(count / validLimit),
      },
    };
  }

  /**
   * Create exam section
   */
  static async createExamSection(examId, sectionData) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    const { title, description, section_type, instruction, time_limit, order_index, settings } =
      sectionData;

    const section = await ExamSection.create({
      exam_id: examId,
      title,
      description,
      section_type,
      instruction,
      time_limit,
      order_index,
      settings: JSON.stringify(settings || {}),
    });

    return this.getExamSectionById(section.id);
  }

  /**
   * Get exam section by ID
   */
  static async getExamSectionById(sectionId) {
    const section = await ExamSection.findByPk(sectionId, {
      include: [
        {
          model: Question,
          as: 'questions',
        },
      ],
    });

    if (!section) {
      throw new NotFoundError('Exam section not found');
    }

    // Parse settings JSON
    if (section.settings) {
      try {
        section.settings = JSON.parse(section.settings);
      } catch (e) {
        section.settings = {};
      }
    }

    return section;
  }

  /**
   * Update exam section
   */
  static async updateExamSection(sectionId, updateData) {
    const section = await ExamSection.findByPk(sectionId);
    if (!section) {
      throw new NotFoundError('Exam section not found');
    }

    const allowedFields = [
      'title',
      'description',
      'section_type',
      'instruction',
      'time_limit',
      'order_index',
      'settings',
    ];

    const filteredData = {};

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === 'settings' && typeof updateData[field] === 'object') {
          filteredData[field] = JSON.stringify(updateData[field]);
        } else {
          filteredData[field] = updateData[field];
        }
      }
    });

    await section.update(filteredData);
    return this.getExamSectionById(sectionId);
  }

  /**
   * Delete exam section
   */
  static async deleteExamSection(sectionId) {
    const section = await ExamSection.findByPk(sectionId);
    if (!section) {
      throw new NotFoundError('Exam section not found');
    }

    await section.destroy();
    return true;
  }

  /**
   * Assign questions to section
   */
  static async assignQuestionsToSection(sectionId, questionIds) {
    const section = await ExamSection.findByPk(sectionId);
    if (!section) {
      throw new NotFoundError('Exam section not found');
    }

    // Validate questions exist
    const questions = await Question.findAll({
      where: {
        id: {
          [Op.in]: questionIds,
        },
      },
    });

    if (questions.length !== questionIds.length) {
      throw new ValidationError('One or more questions not found');
    }

    // Assign questions to section
    await section.setQuestions(questions);

    return this.getExamSectionById(sectionId);
  }

  /**
   * Get exam sections by exam ID
   */
  static async getExamSections(examId) {
    const sections = await ExamSection.findAll({
      where: { exam_id: examId },
      order: [['order_index', 'ASC']],
      include: [
        {
          model: Question,
          as: 'questions',
        },
      ],
    });

    // Parse settings for each section
    return sections.map((section) => {
      if (section.settings) {
        try {
          section.settings = JSON.parse(section.settings);
        } catch (e) {
          section.settings = {};
        }
      }
      return section;
    });
  }

  /**
   * Validate exam structure
   */
  static async validateExamStructure(examId) {
    const exam = await this.getExamById(examId);
    const errors = [];

    // Check if exam has sections
    if (!exam.sections || exam.sections.length === 0) {
      errors.push('Exam must have at least one section');
    }

    // Check each section
    for (const section of exam.sections || []) {
      if (!section.questions || section.questions.length === 0) {
        errors.push(`Section "${section.title}" must have at least one question`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Publish exam
   */
  static async publishExam(examId) {
    const validation = await this.validateExamStructure(examId);
    if (!validation.isValid) {
      throw new ValidationError('Cannot publish exam: ' + validation.errors.join(', '));
    }

    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    await exam.update({
      status: 'published',
      published_at: new Date(),
    });

    return this.getExamById(examId);
  }

  /**
   * Archive exam
   */
  static async archiveExam(examId) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    await exam.update({ status: 'archived' });
    return this.getExamById(examId);
  }

  /**
   * Duplicate exam
   */
  static async duplicateExam(examId, newTitle, createdBy) {
    const originalExam = await this.getExamById(examId);

    // Create new exam
    const newExam = await this.createExam(
      {
        title: newTitle,
        description: originalExam.description,
        exam_type: originalExam.exam_type,
        duration_minutes: originalExam.duration_minutes,
        max_attempts: originalExam.max_attempts,
        pass_threshold: originalExam.pass_threshold,
        instructions: originalExam.instructions,
        settings: originalExam.settings,
      },
      createdBy,
    );

    // Duplicate sections
    for (const section of originalExam.sections) {
      const newSection = await this.createExamSection(newExam.id, {
        title: section.title,
        description: section.description,
        section_type: section.section_type,
        instruction: section.instruction,
        time_limit: section.time_limit,
        order_index: section.order_index,
        settings: section.settings,
      });

      // Assign questions to new section
      if (section.questions && section.questions.length > 0) {
        const questionIds = section.questions.map((q) => q.id);
        await this.assignQuestionsToSection(newSection.id, questionIds);
      }
    }

    return this.getExamById(newExam.id);
  }

  /**
   * Get exam statistics
   */
  static async getExamStats(examId) {
    const exam = await this.getExamById(examId);

    const stats = {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      passRate: 0,
      averageDuration: 0,
    };

    // Get attempt statistics (would need ExamAttempt model)
    // This is a placeholder for the actual implementation

    return stats;
  }

  /**
   * Generate unique exam code
   */
  static async generateExamCode() {
    let code;
    let exists = true;

    while (exists) {
      code = generateCode(8);
      const existingExam = await Exam.findOne({ where: { exam_code: code } });
      exists = !!existingExam;
    }

    return code;
  }

  /**
   * Search exams
   */
  static async searchExams(query, options = {}) {
    const { limit = 10, exam_type, status } = options;

    const where = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { exam_code: { [Op.like]: `%${query}%` } },
      ],
    };

    if (exam_type) {
      where.exam_type = exam_type;
    }

    if (status) {
      where.status = status;
    }

    const exams = await Exam.findAll({
      where,
      attributes: ['id', 'title', 'exam_code', 'exam_type', 'status'],
      limit,
      order: [['title', 'ASC']],
    });

    return exams;
  }

  /**
   * Validate exam settings
   */
  static validateExamSettings(settings) {
    const errors = [];

    if (settings.shuffleQuestions && typeof settings.shuffleQuestions !== 'boolean') {
      errors.push('shuffleQuestions must be boolean');
    }

    if (settings.allowBackNavigation && typeof settings.allowBackNavigation !== 'boolean') {
      errors.push('allowBackNavigation must be boolean');
    }

    if (settings.showResults && typeof settings.showResults !== 'boolean') {
      errors.push('showResults must be boolean');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = ExamService;
