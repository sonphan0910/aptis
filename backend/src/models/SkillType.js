const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SkillType = sequelize.define(
  'SkillType',
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
    skill_type_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    display_order: {
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
