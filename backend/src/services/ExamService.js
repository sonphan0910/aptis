const { 
  Exam, 
  ExamSection, 
  ExamSectionQuestion,
  Question, 
  QuestionType, 
  SkillType, 
  AptisType 
} = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ValidationError, BusinessLogicError } = require('../utils/errors');
const { paginate, generateCode } = require('../utils/helpers');

class ExamService {
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

  static async getExamById(examId) {
    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: ExamSection,
          as: 'sections',
          include: [
            {
              model: SkillType,
              as: 'skillType',
            },
            {
              model: ExamSectionQuestion,
              as: 'questions',
              // ✅ Simple: only basic question info, no deep includes
              include: [
                {
                  model: Question,
                  as: 'Question',
                  attributes: ['id', 'difficulty', 'status'] // Basic info only
                }
              ]
            }
          ]
        }
      ]
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    if (exam.settings) {
      try {
        exam.settings = JSON.parse(exam.settings);
      } catch (e) {
        exam.settings = {};
      }
    }

    return exam;
  }

  static async updateExam(examId, updateData, updatedBy) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

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

  static async deleteExam(examId) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    const attemptCount = await exam.countAttempts();
    if (attemptCount > 0) {
      throw new BusinessLogicError('Cannot delete exam with existing attempts');
    }

    await exam.destroy();
    return true;
  }

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

    if (section.settings) {
      try {
        section.settings = JSON.parse(section.settings);
      } catch (e) {
        section.settings = {};
      }
    }

    return section;
  }

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

  static async deleteExamSection(sectionId) {
    const section = await ExamSection.findByPk(sectionId);
    if (!section) {
      throw new NotFoundError('Exam section not found');
    }

    await section.destroy();
    return true;
  }

  static async assignQuestionsToSection(sectionId, questionIds) {
    const section = await ExamSection.findByPk(sectionId);
    if (!section) {
      throw new NotFoundError('Exam section not found');
    }

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

    await section.setQuestions(questions);

    return this.getExamSectionById(sectionId);
  }

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

  static async validateExamStructure(examId) {
    const exam = await this.getExamById(examId);
    const errors = [];

    if (!exam.sections || exam.sections.length === 0) {
      errors.push('Exam must have at least one section');
    }

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

  static async archiveExam(examId) {
    const exam = await Exam.findByPk(examId);
    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    await exam.update({ status: 'archived' });
    return this.getExamById(examId);
  }

  static async duplicateExam(examId, newTitle, createdBy) {
    const originalExam = await this.getExamById(examId);

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

      if (section.questions && section.questions.length > 0) {
        const questionIds = section.questions.map((q) => q.id);
        await this.assignQuestionsToSection(newSection.id, questionIds);
      }
    }

    return this.getExamById(newExam.id);
  }

  static async getExamStats(examId) {
    const exam = await this.getExamById(examId);

    const stats = {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      passRate: 0,
      averageDuration: 0,
    };


    return stats;
  }

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
