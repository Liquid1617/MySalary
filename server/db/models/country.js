'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью Currency
      Country.belongsTo(models.Currency, {
        foreignKey: 'currency_id',
        as: 'currency'
      });
      
      // Связь с моделью User
      Country.hasMany(models.User, {
        foreignKey: 'country_id',
        as: 'users'
      });
    }
  }
  Country.init({
    code: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 2],
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
    currency_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Currencies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    }
  }, {
    sequelize,
    modelName: 'Country',
    tableName: 'Countries',
    timestamps: true
  });
  return Country;
};