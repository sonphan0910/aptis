const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Model AptisType - Loại kỳ thi APTIS
 * Lưu trữ các loại kỳ thi APTIS khác nhau (VnIC, General, Core...)
 */
const AptisType = sequelize.define(
  'AptisType',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      // Mã loại kỳ thi (VD: APTIS_VNIC, APTIS_GENERAL, APTIS_CORE)
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    aptis_type_name: {
      // Tên loại kỳ thi (VD: APTIS for Vietnamese International Certification)
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      // Mô tả chi tiết về loại kỳ thi này
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      // Trạng thái loại kỳ thi (true: đang sử dụng, false: không sử dụng)
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'aptis_types',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false, // Only createdAt, no updatedAt
  },
);

module.exports = AptisType;
