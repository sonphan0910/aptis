const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuestionOption = sequelize.define(
  'QuestionOption',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id',
      },
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'question_items',
        key: 'id',
      },
      comment: 'NULL for question-level options, NOT NULL for item-level options',
    },
    option_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    option_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_correct: {
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
