const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ExamAttempt = sequelize.define(
  'ExamAttempt',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exams',
        key: 'id',
      },
    },
    attempt_type: {
      type: DataTypes.ENUM('full_exam', 'single_skill'),
      allowNull: false,
    },
    selected_skill_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skill_types',
        key: 'id',
      },
      comment: 'NULL for full_exam, NOT NULL for single_skill',
    },
    attempt_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('in_progress', 'submitted', 'graded', 'reviewed'),
      defaultValue: 'in_progress',
    },
    total_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
  },
  {
    tableName: 'exam_attempts',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'exam_id', 'attempt_type', 'selected_skill_id', 'attempt_number'],
        name: 'unique_attempt',
      },
    ],
  },
);

module.exports = ExamAttempt;
