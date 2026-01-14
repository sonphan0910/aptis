const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model QuestionOption - Lựa chọn/đáp án cho câu hỏi
 * Lưu trữ các đáp án (option) cho câu trắc nghiệm hoặc mục matching
 */
const QuestionOption = sequelize.define(
  'QuestionOption',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      // ID của câu hỏi (NULL nếu là lựa chọn cho một mục)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    item_id: {
      // ID của mục (NULL cho lựa chọn cấp câu hỏi, có giá trị cho lựa chọn cấp mục)
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'question_items',
        key: 'id',
      },
    },
    option_text: {
      // Nội dung lựa chọn (đáp án)
      type: DataTypes.TEXT,
      allowNull: false,
    },
    option_order: {
      // Thứ tự hiển thị lựa chọn (A, B, C, D = 1, 2, 3, 4)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_correct: {
      // Cờ đánh dấu đáp án đúng
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'question_options',
    timestamps: false,
  },
);

module.exports = QuestionOption;
