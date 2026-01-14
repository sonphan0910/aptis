const { AptisType, SkillType, QuestionType, Question, Exam, ExamSection, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getAptisTypes = async (req, res, next) => {
  try {
    const aptisTypes = await AptisType.findAll({
      where: { is_active: true },
      attributes: ['id', 'code', 'aptis_type_name', 'description'],
      order: [['code', 'ASC']],
      raw: true,
    });

    const transformed = aptisTypes.map(type => ({
      id: type.id,
      slug: type.code,
      name: type.aptis_type_name,
      code: type.code,
      description: type.description,
    }));

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSkillTypes = async (req, res, next) => {
  try {
    const skillTypes = await SkillType.findAll({
      attributes: ['id', 'code', 'skill_type_name', 'description', 'display_order'],
      order: [['display_order', 'ASC']],
      raw: true,
    });

    const transformed = skillTypes.map(skill => ({
      id: skill.id,
      slug: skill.code,
      name: skill.skill_type_name,
      code: skill.code,
      description: skill.description,
    }));

    res.json({
      success: true,
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionTypes = async (req, res, next) => {
  try {
    const questionTypes = await QuestionType.findAll({
      include: [
        {
          model: SkillType,
          as: 'skillType',
          attributes: ['id', 'code', 'skill_type_name'],
        },
      ],
      attributes: ['id', 'code', 'question_type_name', 'description', 'skill_type_id', 'scoring_method'],
      order: [['skill_type_id', 'ASC'], ['code', 'ASC']],
    });

    res.json({
      success: true,
      data: questionTypes,
    });
  } catch (error) {
    next(error);
  }
};

exports.getWritingQuestions = async (req, res, next) => {
  try {
    const writingQuestions = await Question.findAll({
      include: [
        {
          model: QuestionType,
          as: 'questionType',
          where: {
            code: {
              [Op.like]: 'WRITING_%'
            }
          },
          attributes: ['code', 'question_type_name', 'scoring_method']
        }
      ],
      attributes: ['id', 'difficulty', 'content', 'status'],
      where: {
        status: 'active'
      },
      order: [
        [{ model: QuestionType, as: 'questionType' }, 'code', 'ASC'],
        ['id', 'ASC']
      ]
    });

    res.json(writingQuestions);
  } catch (error) {
    next(error);
  }
};
