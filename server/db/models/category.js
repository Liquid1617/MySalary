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
      
      // Many-to-many relationship with Budget through BudgetCategory
      Category.hasMany(models.BudgetCategory, {
        foreignKey: 'category_id',
        as: 'budgetCategories'
      });

      // Связь с пользователем для кастомных категорий
      Category.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        allowNull: true
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
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'NULL for system categories, user ID for custom categories'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [1, 50]
      },
      comment: 'FontAwesome icon name for the category'
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#6B7280',
      validate: {
        is: /^#[0-9A-Fa-f]{6}$/
      },
      comment: 'Hex color code for the category icon'
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'TRUE for system categories, FALSE for user-created categories'
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['category_type', 'category_name', 'user_id'],
        name: 'categories_unique_per_user'
      },
      {
        fields: ['user_id'],
        name: 'categories_user_id_idx'
      },
      {
        fields: ['is_system'],
        name: 'categories_is_system_idx'
      }
    ]
  });
  return Category;
};