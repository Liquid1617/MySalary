'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью Country
      Currency.hasMany(models.Country, {
        foreignKey: 'currency_id',
        as: 'countries'
      });
      
      // Связь с моделью Account
      Currency.hasMany(models.Account, {
        foreignKey: 'currency_id',
        as: 'accounts'
      });
    }
  }
  Currency.init({
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 3],
        isUppercase: true,
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true
      }
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        len: [1, 10],
        notEmpty: true
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Currency',
    tableName: 'Currencies',
    timestamps: true
  });
  return Currency;
};