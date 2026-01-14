const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model AiScoringCriteria - Tiêu chí chấm điểm bằng AI
 * Lưu trữ các tiêu chí, trọng số và rubric để AI sử dụng khi chấm điểm bài làm
 */
const AiScoringCriteria = sequelize.define(
  'AiScoringCriteria',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    aptis_type_id: {
      // Loại kỳ thi APTIS (VnIC, General, Core...)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'aptis_types',
        key: 'id',
      },
    },
    question_type_id: {
      // Loại câu hỏi (multiple choice, essay, speaking...)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'question_types',
        key: 'id',
      },
    },
    criteria_name: {
      // Tên tiêu chí chấm điểm (VD: Grammar, Vocabulary, Fluency...)
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      // Mô tả chi tiết về tiêu chí này
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rubric_prompt: {
      // Prompt gửi cho AI để chấm điểm theo tiêu chí này
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_by: {
      // ID của admin/teacher người tạo tiêu chí này
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'ai_scoring_criteria',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['aptis_type_id', 'question_type_id', 'criteria_name'],
        name: 'unique_criteria',
      },
    ],
  },
);

module.exports = AiScoringCriteria;
