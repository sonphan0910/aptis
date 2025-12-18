const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AptisType = sequelize.define(
  'AptisType',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    aptis_type_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
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
