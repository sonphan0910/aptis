const { AiScoringCriteria, AptisType, QuestionType } = require('../../models');
const { paginate, paginationResponse } = require('../../utils/helpers');
const { NotFoundError } = require('../../utils/errors');
const { Op } = require('sequelize');

/**
 * Create AI scoring criteria
 */
exports.createCriteria = async (req, res, next) => {
  try {
    const { aptis_type_id, question_type_id, criteria_name, weight, rubric_prompt, max_score } =
      req.body;

    const criteria = await AiScoringCriteria.create({
      aptis_type_id,
      question_type_id,
      criteria_name,
      weight,
      rubric_prompt,
      max_score,
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
        },
        {
          model: QuestionType,
          as: 'questionType',
          attributes: ['id', 'code', 'question_type_name'],
        },
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
