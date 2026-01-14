const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model QuestionItem - Mục hỏi (item của câu hỏi)
 * Dùng cho các loại câu hỏi phức tạp như Matching, Gap Filling...
 * Một câu hỏi có thể có nhiều mục cần trả lời
 */
const QuestionItem = sequelize.define(
  'QuestionItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      // ID của câu hỏi cha
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    item_text: {
      // Nội dung của mục (VD: "Match this sentence with the image")
      type: DataTypes.TEXT,
      allowNull: false,
    },
    item_order: {
      // Thứ tự mục trong câu hỏi (1, 2, 3...)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correct_option_id: {
      // ID lựa chọn đúng (dùng cho loại MCQ/Matching)
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    answer_text: {
      // Câu trả lời chính xác (dùng cho loại Fill Blanks/Gap Filling)
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_url: {
      // File audio riêng cho mục này (dùng trong listening matching)
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'question_items',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['question_id', 'item_order'],
        name: 'unique_question_item_order',
      },
    ],
  },
);

module.exports = QuestionItem;
