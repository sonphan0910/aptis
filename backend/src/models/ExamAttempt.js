const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model ExamAttempt - Lượt làm bài thi của học sinh
 * Lưu trữ thông tin từng lần học sinh làm bài thi
 */
const ExamAttempt = sequelize.define(
  'ExamAttempt',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      // ID của học sinh làm bài thi
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
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
    attempt_type: {
      // Loại lượt thi: full_exam (toàn bộ), single_skill (một kỹ năng)
      type: DataTypes.ENUM('full_exam', 'single_skill'),
      allowNull: false,
    },
    selected_skill_id: {
      // ID kỹ năng được chọn (NULL nếu là full_exam, có giá trị nếu là single_skill)
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'skill_types',
        key: 'id',
      },
    },
    attempt_number: {
      // Số lần thử (lần 1, lần 2...)
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    start_time: {
      // Thời gian bắt đầu làm bài
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_time: {
      // Thời gian kết thúc/nộp bài
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      // Trạng thái: in_progress (đang làm), submitted (đã nộp), graded (đã chấm), reviewed (đã xem xét)
      type: DataTypes.ENUM('in_progress', 'submitted', 'graded', 'reviewed'),
      defaultValue: 'in_progress',
    },
    total_score: {
      // Tổng điểm cuối cùng của lượt thi này
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
