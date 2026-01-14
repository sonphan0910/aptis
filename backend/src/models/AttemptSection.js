const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model AttemptSection - Phần thi của một lượt làm bài
 * Lưu trữ trạng thái từng phần thi (mục nghe, nói, đọc, viết...)
 */
const AttemptSection = sequelize.define(
  'AttemptSection',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attempt_id: {
      // ID của lượt làm bài thi
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exam_attempts',
        key: 'id',
      },
    },
    exam_section_id: {
      // ID của phần thi (VD: Listening, Speaking, Reading, Writing)
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exam_sections',
        key: 'id',
      },
    },
    started_at: {
      // Thời gian bắt đầu phần thi
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed_at: {
      // Thời gian kết thúc phần thi
      type: DataTypes.DATE,
      allowNull: true,
    },
    section_status: {
      // Trạng thái phần thi: not_started (chưa bắt đầu), in_progress (đang làm), completed (hoàn thành)
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
      defaultValue: 'not_started',
    },
    section_score: {
      // Điểm số phần thi này
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
