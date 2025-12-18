const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamSection = sequelize.define(
  'ExamSection',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exams',
        key: 'id',
      },
    },
    skill_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skill_types',
        key: 'id',
      },
    },
    section_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    instruction: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'exam_sections',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['exam_id', 'section_order'],
        name: 'unique_exam_section_order',
      },
    ],
  },
);

module.exports = ExamSection;
