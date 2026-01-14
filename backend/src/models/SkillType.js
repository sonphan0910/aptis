const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model SkillType - Loại kỹ năng
 * Lưu trữ 4 kỹ năng chính: Listening, Speaking, Reading, Writing
 */
const SkillType = sequelize.define(
  'SkillType',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      // Mã kỹ năng (VD: LISTENING, SPEAKING, READING, WRITING)
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    skill_type_name: {
      // Tên kỹ năng (VD: Listening, Speaking, Reading, Writing)
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      // Mô tả chi tiết kỹ năng này
      type: DataTypes.TEXT,
      allowNull: true,
    },
    display_order: {
      // Thứ tự hiển thị (Listening=1, Speaking=2, Reading=3, Writing=4)
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'skill_types',
    timestamps: false,
  },
);

module.exports = SkillType;
