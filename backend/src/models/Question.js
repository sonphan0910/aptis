const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define(
  'Question',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'question_types',
        key: 'id',
      },
    },
    aptis_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'aptis_types',
        key: 'id',
      },
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    media_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      defaultValue: 'draft',
    },
  },
  {
    tableName: 'questions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

module.exports = Question;
