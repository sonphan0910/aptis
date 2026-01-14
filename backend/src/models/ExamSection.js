const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model ExamSection - Phần thi trong một kỳ thi
 * Lưu trữ các phần thi (Listening, Speaking, Reading, Writing...)
 */
const ExamSection = sequelize.define(
  'ExamSection',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    exam_id: {
      // ID của kỳ thi
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exams',
        key: 'id',
      },
    },
    skill_type_id: {
      // ID loại kỹ năng (Listening, Speaking, Reading, Writing...)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'skill_types',
        key: 'id',
      },
    },
    section_order: {
      // Thứ tự phần thi trong kỳ thi (1, 2, 3...)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration_minutes: {
      // Thời gian làm phần thi này (tính bằng phút)
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    instruction: {
      // Hướng dẫn cho học sinh về phần thi này
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
