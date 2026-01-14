const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model QuestionSampleAnswer - Câu trả lời mẫu cho câu hỏi
 * Lưu trữ đáp án mẫu, các điểm chính, và yêu cầu về độ dài/thời gian
 */
const QuestionSampleAnswer = sequelize.define(
  'QuestionSampleAnswer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      // ID của câu hỏi (1-1 relationship)
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    sample_answer: {
      // Câu trả lời mẫu (dùng cho loại essay, speaking)
      type: DataTypes.TEXT,
      allowNull: true,
    },
    answer_key_points: {
      // Các điểm chính cần có trong câu trả lời (JSON array)
      type: DataTypes.TEXT,
      allowNull: true,
    },
    min_words: {
      // Số từ tối thiểu (dùng cho loại essay)
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_words: {
      // Số từ tối đa (dùng cho loại essay)
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    min_duration_seconds: {
      // Thời gian ghi âm tối thiểu (dùng cho loại speaking)
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_duration_seconds: {
      // Thời gian ghi âm tối đa (dùng cho loại speaking)
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
