'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем базовые счета для существующих пользователей
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM "Users"',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const rubCurrency = await queryInterface.sequelize.query(
      'SELECT id FROM "Currencies" WHERE code = \'RUB\'',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const currencyId = rubCurrency.length > 0 ? rubCurrency[0].id : 1;
    
    // Создаем базовые счета для пользователей
    for (const user of users) {
      await queryInterface.bulkInsert('Accounts', [
        {
          user_id: user.id,
          account_type: 'cash',
          account_name: 'Наличные',
          currency_id: currencyId,
          balance: 0.00,
          is_active: true,
          description: 'Автоматически созданный счет для миграции',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          user_id: user.id,
          account_type: 'bank_account',
          account_name: 'Основной счет',
          currency_id: currencyId,
          balance: 0.00,
          is_active: true,
          description: 'Автоматически созданный счет для миграции',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
    
    // Получаем созданные счета
    const accounts = await queryInterface.sequelize.query(
      'SELECT * FROM "Accounts" WHERE account_name = \'Основной счет\'',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Создаем map для быстрого доступа к счетам по user_id
    const accountMap = {};
    accounts.forEach(account => {
      accountMap[account.user_id] = account.id;
    });
    
    // Миграция данных из таблицы Expenses
    const expenses = await queryInterface.sequelize.query(
      'SELECT * FROM "Expenses"',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (expenses.length > 0) {
      for (const expense of expenses) {
        const accountId = accountMap[expense.user_id];
        if (accountId) {
          await queryInterface.bulkInsert('Transactions', [{
            user_id: expense.user_id,
            account_id: accountId,
            category_id: expense.category_id,
            amount: expense.amount,
            transaction_type: 'expense',
            expense_type: expense.transaction_type,
            description: `Migrated from Expenses table`,
            transaction_date: expense.createdAt,
            is_recurring: false,
            parent_transaction_id: null,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt
          }]);
        }
      }
    }
    
    // Миграция данных из таблицы Incomes
    const incomes = await queryInterface.sequelize.query(
      'SELECT * FROM "Incomes"',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (incomes.length > 0) {
      for (const income of incomes) {
        const accountId = accountMap[income.user_id];
        if (accountId) {
          await queryInterface.bulkInsert('Transactions', [{
            user_id: income.user_id,
            account_id: accountId,
            category_id: income.category_id,
            amount: income.amount,
            transaction_type: 'income',
            expense_type: null,
            description: `Migrated from Incomes table`,
            transaction_date: income.createdAt,
            is_recurring: false,
            parent_transaction_id: null,
            createdAt: income.createdAt,
            updatedAt: income.updatedAt
          }]);
        }
      }
    }
    
    console.log('Data migration completed successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Удаляем мигрированные данные
    await queryInterface.bulkDelete('Transactions', {
      description: {
        [Sequelize.Op.like]: '%Migrated from%'
      }
    });
    
    // Удаляем созданные счета
    await queryInterface.bulkDelete('Accounts', {
      description: 'Автоматически созданный счет для миграции'
    });
    
    console.log('Data migration rollback completed!');
  }
};
