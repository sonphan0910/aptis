const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AttemptSection = sequelize.define(
  'AttemptSection',
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
    exam_section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exam_sections',
        key: 'id',
      },
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    section_status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      defaultValue: 'not_started',
    },
    section_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
  },
  {
    tableName: 'attempt_sections',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['attempt_id', 'exam_section_id'],
        name: 'unique_attempt_section',
      },
    ],
  },
);

module.exports = AttemptSection;
