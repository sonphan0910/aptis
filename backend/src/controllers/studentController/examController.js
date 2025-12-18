const {
  Exam,
  ExamSection,
  ExamSectionQuestion,
  Question,
  AptisType,
  SkillType,
  QuestionType,
  ExamAttempt,
  sequelize,
} = require('../../models');
const { paginate, paginationResponse } = require('../../utils/helpers');
const { NotFoundError } = require('../../utils/errors');
const { Op } = require('sequelize');

/**
 * Get list of published exams with filters and pagination
 */
exports.getExams = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search,
      aptis_type, 
      skill, 
      sort = 'created_at' 
    } = req.query;
    const paginationInfo = paginate(page, limit);
    const { offset } = paginationInfo;
    const validLimit = paginationInfo.limit;

    const where = { status: 'published' };

    // Apply search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Apply APTIS type filter
    if (aptis_type) {
      where.aptis_type_id = parseInt(aptis_type);
    }

    // Determine sort order
    let orderBy = [['created_at', 'DESC']];
    if (sort === 'title') {
      orderBy = [['title', 'ASC']];
    } else if (sort === 'duration') {
      orderBy = [['duration_minutes', 'ASC']];
    }

    // Base includes
    const includes = [
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
            attributes: ['id', 'code', 'skill_type_name'],
          },
        ],
      },
    ];

    // If filtering by skill, add where clause to sections
    if (skill) {
      includes[1].required = true;
      includes[1].where = { skill_type_id: parseInt(skill) };
    }

    let { count, rows } = await Exam.findAndCountAll({
      where,
      include: includes,
      attributes: [
        'id',
        'title',
        'description',
        'duration_minutes',
        'total_score',
        'created_at',
      ],
      offset,
      limit: validLimit,
      order: orderBy,
      distinct: true,
      subQuery: false,
    });

    // Get exam IDs for additional queries
    const examIds = rows.map(e => e.id);

    // If no exams, return early
    if (examIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: validLimit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Get all exam section questions with their question details
    const examSectionQuestions = await ExamSectionQuestion.findAll({
      attributes: ['id', 'exam_section_id', 'question_id'],
      include: [
        {
          model: ExamSection,
          as: 'examSection',
          attributes: ['exam_id'],
        },
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'difficulty'],
        },
      ],
      raw: true,
      nest: true,
    });

    // Build map for question count
    const questionCountMap = {};

    examSectionQuestions.forEach(esq => {
      const examId = esq.examSection?.exam_id;
      if (!examId) return;

      // Count questions
      if (!questionCountMap[examId]) {
        questionCountMap[examId] = 0;
      }
      questionCountMap[examId]++;
    });

    // Count attempts
    const attemptCounts = await ExamAttempt.findAll({
      attributes: [
        'exam_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { exam_id: examIds },
      group: ['exam_id'],
      raw: true,
    });

    const attemptCountMap = {};
    attemptCounts.forEach(ac => {
      attemptCountMap[ac.exam_id] = parseInt(ac.count) || 0;
    });

    // Transform response
    const transformed = rows.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      duration: exam.duration_minutes,
      aptis_type: exam.aptisType?.aptis_type_name,
      aptis_type_id: exam.aptisType?.id,
      section_count: exam.sections?.length || 0,
      skill_types: exam.sections?.map(s => s.skillType?.skill_type_name).filter(Boolean) || [],
      question_count: questionCountMap[exam.id] || 0,
      attempted_count: attemptCountMap[exam.id] || 0,
      created_at: exam.created_at,
    }));

    const totalPages = Math.ceil(count / validLimit);
    const paginatedResults = transformed;

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: validLimit,
        total: transformed.length,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exam details
 */
exports.getExamDetails = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findOne({
      where: { id: examId, status: 'published' },
      include: [
        {
          model: AptisType,
          as: 'aptisType',
        },
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
              attributes: ['id', 'question_id', 'question_order', 'max_score'],
            },
          ],
        },
      ],
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    console.log('[getExamDetails] Exam:', { id: exam.id, title: exam.title });
    if (exam.sections) {
      exam.sections.forEach(section => {
        console.log('[getExamDetails] Section:', { id: section.id, skill_type_id: section.skill_type_id, skillTypeName: section.skillType?.skill_type_name });
      });
    }

    // Count total questions
    const totalQuestions = exam.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0,
    );

    res.json({
      success: true,
      data: {
        ...exam.toJSON(),
        totalQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's attempts history
 */
exports.getMyAttempts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { offset, limit: validLimit } = paginate(page, limit);
    const studentId = req.user.userId;

    const { count, rows } = await ExamAttempt.findAndCountAll({
      where: { student_id: studentId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'duration_minutes'],
          include: [
            {
              model: AptisType,
              as: 'aptisType',
              attributes: ['id', 'code', 'aptis_type_name'],
            },
          ],
        },
        {
          model: SkillType,
          as: 'selectedSkill',
          attributes: ['id', 'code', 'skill_type_name'],
        },
      ],
      offset,
      limit: validLimit,
      order: [['start_time', 'DESC']],
    });

    res.json({
      success: true,
      ...paginationResponse(rows, parseInt(page), validLimit, count),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available skills for an exam
 */
exports.getExamSkills = async (req, res, next) => {
  try {
    const { examId } = req.params;

    // Get exam with its sections and skills
    const exam = await Exam.findOne({
      where: { id: examId, status: 'published' },
      include: [
        {
          model: ExamSection,
          as: 'sections',
          include: [
            {
              model: SkillType,
              as: 'skillType',
              attributes: ['id', 'code', 'skill_type_name', 'description'],
            },
          ],
        },
      ],
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Extract unique skills from exam sections
    const skillsMap = new Map();
    exam.sections.forEach(section => {
      if (section.skillType) {
        const skill = section.skillType;
        skillsMap.set(skill.id, {
          id: skill.id,
          code: skill.code,
          skill_type_name: skill.skill_type_name,
          description: skill.description,
        });
      }
    });

    const skills = Array.from(skillsMap.values());

    res.json({
      success: true,
      data: {
        exam_id: exam.id,
        exam_title: exam.title,
        skills,
      },
    });
  } catch (error) {
    next(error);
  }
};
