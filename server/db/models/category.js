'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью Transaction
      Category.hasMany(models.Transaction, {
        foreignKey: 'category_id',
        as: 'transactions'
      });
      
      // Связь с моделью Budget
      Category.hasMany(models.Budget, {
        foreignKey: 'category_id',
        as: 'budgets'
      });
    }
  }
  Category.init({
    category_type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        isIn: [['income', 'expense']]
      }
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['category_type', 'category_name']
      }
    ]
  });
  return Category;
};