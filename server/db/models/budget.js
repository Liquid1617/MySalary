'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Budget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью User
      Budget.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Many-to-many relationship with Category through BudgetCategory
      Budget.hasMany(models.BudgetCategory, {
        foreignKey: 'budget_id',
        as: 'categories'
      });
    }
  }
  Budget.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    limit_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    period_type: {
      type: DataTypes.ENUM('month', 'week', 'custom'),
      allowNull: false,
      defaultValue: 'month',
      validate: {
        isIn: [['month', 'week', 'custom']]
      }
    },
    custom_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isRequiredForCustomPeriod(value) {
          if (this.period_type === 'custom' && !value) {
            throw new Error('Start date is required for custom period');
          }
        }
      }
    },
    custom_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isRequiredForCustomPeriod(value) {
          if (this.period_type === 'custom' && !value) {
            throw new Error('End date is required for custom period');
          }
        },
        isAfterStartDate(value) {
          if (this.period_type === 'custom' && value && this.custom_start_date && value <= this.custom_start_date) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    rollover: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Budget',
    tableName: 'Budgets',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Budget;
};