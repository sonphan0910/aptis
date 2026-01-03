const { AiScoringCriteria, AptisType, QuestionType, SkillType, User } = require('../../models');
const { paginate, paginationResponse } = require('../../utils/helpers');
const { NotFoundError } = require('../../utils/errors');
const { Op } = require('sequelize');

/**
 * Create AI scoring criteria
 */
exports.createCriteria = async (req, res, next) => {
  try {
    const { aptis_type_id, question_type_id, criteria_name, weight, rubric_prompt, max_score, description } =
      req.body;
    
    // Get user from request (should be set by auth middleware)
    const userId = req.user?.userId;
    
    console.log('[CriteriaController] Create - User from auth:', {
      hasUser: !!req.user,
      userId: req.user?.userId,
      email: req.user?.email,
      role: req.user?.role
    });
    
    if (!userId) {
      console.error('[CriteriaController] No userId found in req.user:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found'
      });
    }

    const criteria = await AiScoringCriteria.create({
      aptis_type_id,
      question_type_id,
      criteria_name,
      weight,
      rubric_prompt,
      max_score,
      description,
      created_by: userId
    });

    res.status(201).json({
      success: true,
      data: criteria,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get criteria list
 */
exports.getCriteriaList = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, aptis_type, question_type, search } = req.query;
    const { offset, limit: validLimit } = paginate(page, limit);

    const where = {};
    
    // Add search filter
    if (search) {
      where[Op.or] = [
        { criteria_name: { [Op.iLike]: `%${search}%` } },
        { rubric_prompt: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Add type filters
    if (aptis_type) {
      where.aptis_type_id = aptis_type;
    }
    if (question_type) {
      where.question_type_id = question_type;
    }

    const { count, rows } = await AiScoringCriteria.findAndCountAll({
      where,
      include: [
        {
          model: AptisType,
          as: 'aptisType',
          attributes: ['id', 'code', 'aptis_type_name'],
          required: false
        },
        {
          model: QuestionType,
          as: 'questionType',
          attributes: ['id', 'code', 'question_type_name'],
          required: false
        }
      ],
      offset,
      limit: validLimit,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      page: parseInt(page),
      limit: validLimit,
      total: count,
      totalPages: Math.ceil(count / validLimit)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single criteria by ID
 */
exports.getCriteriaById = async (req, res, next) => {
  try {
    const { criteriaId } = req.params;

    const criteria = await AiScoringCriteria.findByPk(criteriaId, {
      include: [
        {
          model: AptisType,
          as: 'aptisType',
          attributes: ['id', 'code', 'aptis_type_name'],
          required: false
        },
        {
          model: QuestionType,
          as: 'questionType',
          attributes: ['id', 'code', 'question_type_name'],
          required: false
        }
      ]
    });

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: 'Criteria not found'
      });
    }

    res.json({
      success: true,
      data: criteria
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get question types for criteria (Speaking and Writing only)
 */
exports.getQuestionTypesForCriteria = async (req, res, next) => {
  try {
    const speakingCodes = [
      'SPEAKING_INTRO',
      'SPEAKING_DESCRIPTION',
      'SPEAKING_COMPARISON',
      'SPEAKING_DISCUSSION'
    ];
    
    const writingCodes = [
      'WRITING_SHORT',
      'WRITING_LONG',
      'WRITING_EMAIL',
      'WRITING_ESSAY'
    ];

    const allCodes = [...speakingCodes, ...writingCodes];

    const types = await QuestionType.findAll({
      where: {
        code: {
          [Op.in]: allCodes
        }
      },
      include: [
        {
          model: SkillType,
          as: 'skillType',
          attributes: ['id', 'code', 'skill_type_name']
        }
      ],
      order: [['code', 'ASC']],
      attributes: ['id', 'code', 'question_type_name', 'skill_type_id']
    });

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('getQuestionTypesForCriteria error:', error);
    next(error);
  }
};

/**
 * Update criteria
 */
exports.updateCriteria = async (req, res, next) => {
  try {
    const { criteriaId } = req.params;
    const updateData = req.body;

    const criteria = await AiScoringCriteria.findByPk(criteriaId);

    if (!criteria) {
      throw new NotFoundError('Criteria not found');
    }

    await criteria.update(updateData);

    res.json({
      success: true,
      data: criteria,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete criteria
 */
exports.deleteCriteria = async (req, res, next) => {
  try {
    const { criteriaId } = req.params;

    const criteria = await AiScoringCriteria.findByPk(criteriaId);

    if (!criteria) {
      throw new NotFoundError('Criteria not found');
    }

    await criteria.destroy();

    res.json({
      success: true,
      message: 'Criteria deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Preview criteria
 */
exports.previewCriteria = async (req, res, next) => {
  try {
    const { criteriaId } = req.params;

    const criteria = await AiScoringCriteria.findByPk(criteriaId);

    if (!criteria) {
      throw new NotFoundError('Criteria not found');
    }

    res.json({
      success: true,
      data: criteria,
    });
  } catch (error) {
    next(error);
  }
};
