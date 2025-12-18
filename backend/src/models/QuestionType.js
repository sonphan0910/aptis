const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuestionType = sequelize.define(
  'QuestionType',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    skill_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skill_types',
        key: 'id',
      },
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    question_type_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    instruction_template: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    scoring_method: {
      type: DataTypes.ENUM('auto', 'ai', 'manual'),
      allowNull: false,
    },
  },
  {
    tableName: 'question_types',
    timestamps: false,
  },
);

module.exports = QuestionType;
