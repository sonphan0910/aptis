const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AiScoringCriteria = sequelize.define(
  'AiScoringCriteria',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    aptis_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'aptis_types',
        key: 'id',
      },
    },
    question_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'question_types',
        key: 'id',
      },
    },
    criteria_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rubric_prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    max_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'ai_scoring_criteria',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['aptis_type_id', 'question_type_id', 'criteria_name'],
        name: 'unique_criteria',
      },
    ],
  },
);

module.exports = AiScoringCriteria;
