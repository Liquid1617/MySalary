'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      transaction_type: {
        type: Sequelize.ENUM('income', 'expense'),
        allowNull: false
      },
      expense_type: {
        type: Sequelize.ENUM('deposit', 'debt'),
        allowNull: true // NULL для доходов
      },
      description: {
        type: Sequelize.STRING
      },
      transaction_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      is_recurring: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      parent_transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Добавляем индексы для производительности
    await queryInterface.addIndex('Transactions', ['user_id', 'transaction_date']);
    await queryInterface.addIndex('Transactions', ['account_id']);
    await queryInterface.addIndex('Transactions', ['category_id']);
    await queryInterface.addIndex('Transactions', ['transaction_type']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};