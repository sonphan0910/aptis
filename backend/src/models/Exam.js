const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exam = sequelize.define(
  'Exam',
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'exams',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Only createdAt
  },
);

module.exports = Exam;
