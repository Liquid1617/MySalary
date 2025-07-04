'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Связь с моделью User
      Account.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Связь с моделью Currency
      Account.belongsTo(models.Currency, {
        foreignKey: 'currency_id',
        as: 'currency'
      });
      
      // Связь с моделью Transaction
      Account.hasMany(models.Transaction, {
        foreignKey: 'account_id',
        as: 'transactions'
      });
    }
  }
  Account.init({
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
    account_type: {
      type: DataTypes.ENUM('cash', 'debit_card', 'credit_card', 'bank_account', 'digital_wallet'),
      allowNull: false,
      validate: {
        isIn: [['cash', 'debit_card', 'credit_card', 'bank_account', 'digital_wallet']]
      }
    },
    account_name: {
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
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        isDecimal: true
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    description: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 255]
      }
    }
  }, {
    sequelize,
    modelName: 'Account',
    tableName: 'Accounts',
    timestamps: true
  });
  return Account;
};