const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuestionItem = sequelize.define(
  'QuestionItem',
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
    item_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    item_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correct_option_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'For MCQ/Matching types',
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'For Fill Blanks/Gap Filling types',
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
