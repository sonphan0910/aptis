const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model ExamSectionQuestion - Câu hỏi trong một phần thi
 * Lưu trữ các câu hỏi và thứ tự của chúng trong phần thi
 */
const ExamSectionQuestion = sequelize.define(
  'ExamSectionQuestion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_section_id: {
      // ID của phần thi
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exam_sections',
        key: 'id',
      },
    },
    question_id: {
      // ID của câu hỏi
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    question_order: {
      // Thứ tự câu hỏi trong phần thi (1, 2, 3...)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_score: {
      // Điểm tối đa cho câu hỏi này
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'exam_section_questions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Only createdAt
    indexes: [
      {
        unique: true,
        fields: ['exam_section_id', 'question_id'],
        name: 'unique_section_question',
      },
    ],
  },
);

module.exports = ExamSectionQuestion;
