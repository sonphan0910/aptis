const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model User - Người dùng
 * Lưu trữ thông tin cơ bản của admin, teacher, và student
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      // Email (duy nhất, dùng để đăng nhập)
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      // Mật khẩu đã mã hóa (hash)
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      // Họ tên đầy đủ
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      // Vai trò: admin (quản trị), teacher (giáo viên), student (học sinh)
      type: DataTypes.ENUM('admin', 'teacher', 'student'),
      allowNull: false,
    },
    phone: {
      // Số điện thoại
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    avatar_url: {
      // URL ảnh đại diện
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      // Trạng thái: active (hoạt động), inactive (không hoạt động), banned (bị khóa)
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      defaultValue: 'active',
    },
    last_login: {
      // Lần đăng nhập cuối cùng
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

module.exports = User;
