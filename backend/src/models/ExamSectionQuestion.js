const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamSectionQuestion = sequelize.define(
  'ExamSectionQuestion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exam_sections',
        key: 'id',
      },
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    question_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_score: {
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
