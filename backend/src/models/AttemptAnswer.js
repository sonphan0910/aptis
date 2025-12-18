const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AttemptAnswer = sequelize.define(
  'AttemptAnswer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exam_attempts',
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
    answer_type: {
      type: DataTypes.ENUM('option', 'text', 'audio', 'json'),
      allowNull: false,
    },
    selected_option_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'question_options',
        key: 'id',
      },
    },
    answer_json: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON structure for matching, ordering, fill_blanks',
    },
    text_answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    audio_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    transcribed_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Speech-to-text result from Whisper.js',
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    ai_feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Overall AI feedback summary',
    },
    manual_feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    graded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    auto_graded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ai_graded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    needs_review: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    final_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    answered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'attempt_answers',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['attempt_id', 'question_id'],
        name: 'unique_attempt_answer',
      },
    ],
  },
);

module.exports = AttemptAnswer;
