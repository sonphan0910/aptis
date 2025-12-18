const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnswerAiFeedback = sequelize.define(
  'AnswerAiFeedback',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    answer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'attempt_answers',
        key: 'id',
      },
    },
    criteria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ai_scoring_criteria',
        key: 'id',
      },
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    suggestions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    strengths: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    weaknesses: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'answer_ai_feedbacks',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Only createdAt
  },
);

module.exports = AnswerAiFeedback;
