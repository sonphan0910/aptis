const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model Exam - Kỳ thi
 * Lưu trữ thông tin kỳ thi, thời gian làm bài, tổng điểm
 */
const Exam = sequelize.define(
  'Exam',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    aptis_type_id: {
      // Loại kỳ thi APTIS
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'aptis_types',
        key: 'id',
      },
    },
    title: {
      // Tên kỳ thi (VD: APTIS Practice Test 2024)
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      // Mô tả chi tiết về kỳ thi
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration_minutes: {
      // Thời gian làm bài (tính bằng phút)
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_score: {
      // Tổng điểm tối đa của kỳ thi
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    status: {
      // Trạng thái kỳ thi: draft (nháp), published (xuất bản), archived (lưu trữ)
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    created_by: {
      // ID của admin/teacher tạo kỳ thi này
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    published_at: {
      // Thời gian xuất bản kỳ thi
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
