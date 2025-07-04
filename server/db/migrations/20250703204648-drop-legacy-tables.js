'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем, что данные успешно мигрированы в Transactions
    const transactionCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Transactions" WHERE description LIKE \'%Migrated from%\'',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const expenseCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Expenses"',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const incomeCount = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Incomes"',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${transactionCount[0].count} migrated transactions`);
    console.log(`Found ${expenseCount[0].count} expenses and ${incomeCount[0].count} incomes to be removed`);
    
    // Удаляем таблицы в правильном порядке (сначала зависимые)
    console.log('Dropping Expenses table...');
    await queryInterface.dropTable('Expenses');
    
    console.log('Dropping Incomes table...');
    await queryInterface.dropTable('Incomes');
    
    console.log('Legacy tables successfully removed!');
  },

  async down(queryInterface, Sequelize) {
    // В случае отката восстанавливаем таблицы
    console.log('Recreating Expenses table...');
    await queryInterface.createTable('Expenses', {
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
      account_type: {
        type: Sequelize.ENUM('cash', 'debit_card', 'credit_card', 'bank_account', 'digital_wallet'),
        allowNull: false
      },
      account_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      transaction_type: {
        type: Sequelize.ENUM('deposit', 'debt'),
        allowNull: false
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

    console.log('Recreating Incomes table...');
    await queryInterface.createTable('Incomes', {
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
      account_type: {
        type: Sequelize.ENUM('cash', 'debit_card', 'credit_card', 'bank_account', 'digital_wallet'),
        allowNull: false
      },
      account_name: {
        type: Sequelize.STRING,
        allowNull: false
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
    
    console.log('Legacy tables restored!');
  }
};
