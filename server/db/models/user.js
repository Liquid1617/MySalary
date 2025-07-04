'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью Country
      User.belongsTo(models.Country, {
        foreignKey: 'country_id',
        as: 'country'
      });
      
      // Связь с моделью Account
      User.hasMany(models.Account, {
        foreignKey: 'user_id',
        as: 'accounts'
      });
      
      // Связь с моделью Transaction
      User.hasMany(models.Transaction, {
        foreignKey: 'user_id',
        as: 'transactions'
      });
      
      // Связь с моделью Budget
      User.hasMany(models.Budget, {
        foreignKey: 'user_id',
        as: 'budgets'
      });
      
      // Связь с моделью Tag
      User.hasMany(models.Tag, {
        foreignKey: 'user_id',
        as: 'tags'
      });
    }
  }
  User.init({
    login: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        len: [10, 20]
      }
    },
    country_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Countries',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  });
  return User;
};