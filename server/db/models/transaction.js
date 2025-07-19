'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью User
      Transaction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Связь с моделью Account (исходный счёт)
      Transaction.belongsTo(models.Account, {
        foreignKey: 'account_id',
        as: 'account'
      });
      
      // Связь с моделью Account (целевой счёт для transfer)
      Transaction.belongsTo(models.Account, {
        foreignKey: 'transfer_to',
        as: 'targetAccount'
      });
      
      // Связь с моделью Category
      Transaction.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      
      // Связь many-to-many с моделью Tag через TransactionTag
      Transaction.belongsToMany(models.Tag, {
        through: 'TransactionTags',
        foreignKey: 'transaction_id',
        otherKey: 'tag_id',
        as: 'tags'
      });
    }
  }
  Transaction.init({
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
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Accounts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
          category_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL для transfer транзакций
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0
      }
    },
    transaction_type: {
      type: DataTypes.ENUM('income', 'expense', 'transfer'),
      allowNull: false,
      validate: {
        isIn: [['income', 'expense', 'transfer']],
        // Проверка согласованности с category_type будет добавлена через хук
      }
    },
    transfer_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    description: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 255]
      }
    },
    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'posted'),
      allowNull: false,
      defaultValue: 'posted'
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'Transactions',
    timestamps: true,
    hooks: {
      // Хук для проверки согласованности category_type и transaction_type
      async beforeCreate(transaction, options) {
        // Для transfer транзакций category не требуется
        if (transaction.transaction_type === 'transfer') {
          if (!transaction.transfer_to) {
            throw new Error('Transfer transactions must have transfer_to account specified');
          }
          return;
        }
        
        // Для обычных транзакций проверяем категорию
        if (!transaction.category_id) {
          throw new Error('Non-transfer transactions must have a category');
        }
        
        const Category = sequelize.models.Category;
        const category = await Category.findByPk(transaction.category_id);
        
        if (category && category.category_type !== transaction.transaction_type) {
          throw new Error(`Category type '${category.category_type}' does not match transaction type '${transaction.transaction_type}'`);
        }
      },
      
      async beforeUpdate(transaction, options) {
        // Для transfer транзакций category не требуется
        if (transaction.transaction_type === 'transfer') {
          if (!transaction.transfer_to) {
            throw new Error('Transfer transactions must have transfer_to account specified');
          }
          return;
        }
        
        if (transaction.changed('category_id') || transaction.changed('transaction_type')) {
          // Для обычных транзакций проверяем категорию
          if (!transaction.category_id) {
            throw new Error('Non-transfer transactions must have a category');
          }
          
          const Category = sequelize.models.Category;
          const category = await Category.findByPk(transaction.category_id);
          
          if (category && category.category_type !== transaction.transaction_type) {
            throw new Error(`Category type '${category.category_type}' does not match transaction type '${transaction.transaction_type}'`);
          }
        }
      }
    }
  });
  return Transaction;
};