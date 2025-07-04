'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Adding performance indexes...');
    
    // 1. TRANSACTIONS - дополнительные индексы для аналитики
    
    // Индекс по сумме для сортировки и фильтрации диапазонов
    await queryInterface.addIndex('Transactions', ['amount'], {
      name: 'idx_transactions_amount'
    });
    
    // Отдельный индекс по дате для временных запросов
    await queryInterface.addIndex('Transactions', ['transaction_date'], {
      name: 'idx_transactions_date'
    });
    
    // Композитный индекс для получения операций пользователя по типу и дате
    await queryInterface.addIndex('Transactions', ['user_id', 'transaction_type', 'transaction_date'], {
      name: 'idx_transactions_user_type_date'
    });
    
    // Индекс для отчетов по категориям во времени
    await queryInterface.addIndex('Transactions', ['category_id', 'transaction_date'], {
      name: 'idx_transactions_category_date'
    });
    
    // Частичный индекс для родительских транзакций (не NULL)
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_transactions_parent
      ON "Transactions" (parent_transaction_id)
      WHERE parent_transaction_id IS NOT NULL;
    `);
    
    // 2. ACCOUNTS - индексы для управления счетами
    
    // Индекс по балансу для сортировки
    await queryInterface.addIndex('Accounts', ['balance'], {
      name: 'idx_accounts_balance'
    });
    
    // Композитный индекс для активных счетов пользователя
    await queryInterface.addIndex('Accounts', ['user_id', 'is_active'], {
      name: 'idx_accounts_user_active'
    });
    
    // Индекс для группировки по валютам
    await queryInterface.addIndex('Accounts', ['currency_id', 'is_active'], {
      name: 'idx_accounts_currency_active'
    });
    
    // 3. BUDGETS - индексы для планирования
    
    // Композитный индекс для активных бюджетов пользователя
    await queryInterface.addIndex('Budgets', ['user_id', 'is_active'], {
      name: 'idx_budgets_user_active'
    });
    
    // Индекс для отчетов по типам периодов
    await queryInterface.addIndex('Budgets', ['period_type', 'is_active'], {
      name: 'idx_budgets_period_active'
    });
    
    // Индекс для поиска текущих бюджетов
    await queryInterface.addIndex('Budgets', ['start_date', 'end_date'], {
      name: 'idx_budgets_date_range'
    });
    
    // 4. CATEGORIES - отдельный индекс по типу
    await queryInterface.addIndex('Categories', ['category_type'], {
      name: 'idx_categories_type'
    });
    
    // 5. USERS - дополнительные индексы для поиска
    
    // Если нет уникальных индексов, создаем обычные для поиска
    await queryInterface.addIndex('Users', ['email'], {
      name: 'idx_users_email_lookup'
    });
    
    await queryInterface.addIndex('Users', ['login'], {
      name: 'idx_users_login_lookup'
    });
    
    // 6. ПОЛНОТЕКСТОВЫЙ ПОИСК
    
    // GIN индекс для поиска по описанию транзакций (PostgreSQL)
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_transactions_description_fulltext
      ON "Transactions" USING gin(to_tsvector('russian', description))
      WHERE description IS NOT NULL AND description != '';
    `);
    
    // GIN индекс для поиска по названиям счетов
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_accounts_name_fulltext
      ON "Accounts" USING gin(to_tsvector('russian', account_name));
    `);
    
    console.log('Performance indexes added successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing performance indexes...');
    
    // Удаляем созданные индексы
    const indexesToDrop = [
      'idx_transactions_amount',
      'idx_transactions_date', 
      'idx_transactions_user_type_date',
      'idx_transactions_category_date',
      'idx_transactions_parent',
      'idx_accounts_balance',
      'idx_accounts_user_active',
      'idx_accounts_currency_active',
      'idx_budgets_user_active',
      'idx_budgets_period_active',
      'idx_budgets_date_range',
      'idx_categories_type',
      'idx_users_email_lookup',
      'idx_users_login_lookup',
      'idx_transactions_description_fulltext',
      'idx_accounts_name_fulltext'
    ];
    
    for (const indexName of indexesToDrop) {
      try {
        await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${indexName};`);
      } catch (error) {
        console.log(`Could not drop index ${indexName}:`, error.message);
      }
    }
    
    console.log('Performance indexes removed!');
  }
};
