const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model QuestionType - Loại câu hỏi
 * Lưu trữ các loại câu hỏi khác nhau (MCQ, Essay, Matching, Speaking...)
 * và cách chấm điểm cho từng loại
 */
const QuestionType = sequelize.define(
  'QuestionType',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    skill_type_id: {
      // ID loại kỹ năng (Listening, Speaking, Reading, Writing)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skill_types',
        key: 'id',
      },
    },
    code: {
      // Mã loại câu hỏi (VD: MCQ, ESSAY, MATCHING, SPEAKING, FILL_BLANK)
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    question_type_name: {
      // Tên loại câu hỏi (VD: Multiple Choice, Essay, Matching)
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      // Mô tả chi tiết loại câu hỏi này
      type: DataTypes.TEXT,
      allowNull: true,
    },
    instruction_template: {
      // Mẫu hướng dẫn cho loại câu hỏi này
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scoring_method: {
      // Phương pháp chấm: auto (tự động), ai (AI chấm), manual (chấm tay)
      type: DataTypes.ENUM('auto', 'ai', 'manual'),
      allowNull: false,
    },
  },
  {
    tableName: 'question_types',
    timestamps: false,
  },
);

module.exports = QuestionType;
