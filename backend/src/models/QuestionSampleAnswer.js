const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuestionSampleAnswer = sequelize.define(
  'QuestionSampleAnswer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    sample_answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    answer_key_points: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of key points',
    },
    min_words: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_words: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    min_duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'question_sample_answers',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

module.exports = QuestionSampleAnswer;
