'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BudgetCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Belongs to Budget
      BudgetCategory.belongsTo(models.Budget, {
        foreignKey: 'budget_id',
        as: 'budget'
      });
      
      // Belongs to Category
      BudgetCategory.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
    }
  }
  BudgetCategory.init({
    budget_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Budgets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        isInt: {
          msg: 'Category ID must be an integer'
        },
        min: {
          args: [1],
          msg: 'Category ID must be positive'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'BudgetCategory',
    tableName: 'BudgetCategories',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['budget_id', 'category_id']
      }
    ],
    hooks: {
      async beforeCreate(budgetCategory, options) {
        // Validate that category exists and is of type 'expense'
        const { Category } = sequelize.models;
        const category = await Category.findByPk(budgetCategory.category_id);
        
        if (!category) {
          throw new Error(`Category with ID ${budgetCategory.category_id} does not exist`);
        }
        
        if (category.category_type !== 'expense') {
          throw new Error(`Category "${category.category_name}" is not an expense category. Only expense categories can be used in budgets.`);
        }
      },
      
      async beforeUpdate(budgetCategory, options) {
        // Only validate if category_id is being changed
        if (budgetCategory.changed('category_id')) {
          const { Category } = sequelize.models;
          const category = await Category.findByPk(budgetCategory.category_id);
          
          if (!category) {
            throw new Error(`Category with ID ${budgetCategory.category_id} does not exist`);
          }
          
          if (category.category_type !== 'expense') {
            throw new Error(`Category "${category.category_name}" is not an expense category. Only expense categories can be used in budgets.`);
          }
        }
      }
    }
  });
  return BudgetCategory;
};