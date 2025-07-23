'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Creating database views...');
    
    // 1. ПОЛНАЯ ИНФОРМАЦИЯ О ТРАНЗАКЦИЯХ
    await queryInterface.sequelize.query(`
      CREATE VIEW transaction_details_view AS
      SELECT 
        t.id,
        t.amount,
        t.transaction_type,
        t.expense_type,
        t.description,
        t.transaction_date,
        t.is_recurring,
        t."createdAt",
        t."updatedAt",
        -- Информация о пользователе
        u.login as user_login,
        u.email as user_email,
        -- Информация о счете
        a.account_name,
        a.account_type,
        a.balance as account_balance,
        -- Информация о валюте
        curr.code as currency_code,
        curr.symbol as currency_symbol,
        -- Информация о категории
        cat.category_name,
        cat.category_type,
        -- Информация о стране
        country.name as country_name,
        country.code as country_code,
        -- Теги (агрегированные)
        COALESCE(
          STRING_AGG(tags.name, ', ' ORDER BY tags.name),
          ''
        ) as tags,
        -- Родительская транзакция
        parent_t.description as parent_description
      FROM "Transactions" t
      LEFT JOIN "Users" u ON t.user_id = u.id
      LEFT JOIN "Accounts" a ON t.account_id = a.id
      LEFT JOIN "Currencies" curr ON a.currency_id = curr.id
      LEFT JOIN "Categories" cat ON t.category_id = cat.id
      LEFT JOIN "Countries" country ON u.country_id = country.id
      LEFT JOIN "TransactionTags" tt ON t.id = tt.transaction_id
      LEFT JOIN "Tags" tags ON tt.tag_id = tags.id
      LEFT JOIN "Transactions" parent_t ON t.parent_transaction_id = parent_t.id
      WHERE t."deletedAt" IS NULL
      GROUP BY t.id, u.login, u.email, a.account_name, a.account_type, a.balance,
               curr.code, curr.symbol, cat.category_name, cat.category_type,
               country.name, country.code, parent_t.description;
    `);
    
    // 2. СВОДКА БАЛАНСОВ ПОЛЬЗОВАТЕЛЯ
    await queryInterface.sequelize.query(`
      CREATE VIEW user_balance_summary_view AS
      SELECT 
        u.id as user_id,
        u.login,
        u.email,
        curr.code as currency_code,
        curr.symbol as currency_symbol,
        COUNT(a.id) as accounts_count,
        SUM(a.balance) as total_balance,
        SUM(CASE WHEN a.account_type = 'cash' THEN a.balance ELSE 0 END) as cash_balance,
        SUM(CASE WHEN a.account_type IN ('debit_card', 'bank_account') THEN a.balance ELSE 0 END) as bank_balance,
        SUM(CASE WHEN a.account_type = 'credit_card' THEN a.balance ELSE 0 END) as credit_balance
      FROM "Users" u
      LEFT JOIN "Accounts" a ON u.id = a.user_id AND a.is_active = true AND a."deletedAt" IS NULL
      LEFT JOIN "Currencies" curr ON a.currency_id = curr.id
      WHERE u."deletedAt" IS NULL
      GROUP BY u.id, u.login, u.email, curr.code, curr.symbol;
    `);
    
    // 3. ЕЖЕМЕСЯЧНАЯ СТАТИСТИКА (МАТЕРИАЛИЗОВАННОЕ ПРЕДСТАВЛЕНИЕ)
    await queryInterface.sequelize.query(`
      CREATE MATERIALIZED VIEW monthly_expense_summary_mv AS
      SELECT 
        u.id as user_id,
        u.login,
        EXTRACT(YEAR FROM t.transaction_date) as year,
        EXTRACT(MONTH FROM t.transaction_date) as month,
        cat.category_name,
        cat.category_type,
        COUNT(t.id) as transaction_count,
        SUM(t.amount) as total_amount,
        AVG(t.amount) as avg_amount,
        MIN(t.amount) as min_amount,
        MAX(t.amount) as max_amount,
        curr.code as currency_code
      FROM "Transactions" t
      JOIN "Users" u ON t.user_id = u.id
      JOIN "Categories" cat ON t.category_id = cat.id
      JOIN "Accounts" a ON t.account_id = a.id
      JOIN "Currencies" curr ON a.currency_id = curr.id
      WHERE t."deletedAt" IS NULL
        AND u."deletedAt" IS NULL
        AND t.transaction_date >= CURRENT_DATE - INTERVAL '2 years'
      GROUP BY u.id, u.login, 
               EXTRACT(YEAR FROM t.transaction_date),
               EXTRACT(MONTH FROM t.transaction_date),
               cat.category_name, cat.category_type, curr.code;
    `);
    
    // Создаем индекс для материализованного представления
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_monthly_summary_user_date
      ON monthly_expense_summary_mv (user_id, year, month);
    `);
    
    // 4. ПРОГРЕСС БЮДЖЕТА
    await queryInterface.sequelize.query(`
      CREATE VIEW budget_progress_view AS
      SELECT 
        b.id as budget_id,
        b.user_id,
        u.login,
        b.planned_amount,
        b.period_type,
        b.start_date,
        b.end_date,
        cat.category_name,
        cat.category_type,
        COALESCE(spent.total_spent, 0) as total_spent,
        b.planned_amount - COALESCE(spent.total_spent, 0) as remaining,
        CASE 
          WHEN b.planned_amount > 0 THEN 
            ROUND((COALESCE(spent.total_spent, 0) / b.planned_amount * 100), 2)
          ELSE 0 
        END as spent_percentage,
        CASE 
          WHEN CURRENT_DATE BETWEEN b.start_date AND b.end_date THEN 'ACTIVE'
          WHEN CURRENT_DATE > b.end_date THEN 'COMPLETED'
          ELSE 'FUTURE'
        END as status
      FROM "Budgets" b
      JOIN "Users" u ON b.user_id = u.id
      JOIN "Categories" cat ON b.category_id = cat.id
      LEFT JOIN (
        SELECT 
          t.user_id,
          t.category_id,
          SUM(t.amount) as total_spent
        FROM "Transactions" t
        WHERE t.transaction_type = 'expense'
          AND t."deletedAt" IS NULL
        GROUP BY t.user_id, t.category_id
      ) spent ON b.user_id = spent.user_id AND b.category_id = spent.category_id
      WHERE b."deletedAt" IS NULL
        AND u."deletedAt" IS NULL;
    `);
    
    // 5. ПОИСКОВОЕ ПРЕДСТАВЛЕНИЕ
    await queryInterface.sequelize.query(`
      CREATE VIEW transaction_search_view AS
      SELECT 
        t.id,
        t.user_id,
        t.amount,
        t.transaction_type,
        t.transaction_date,
        t.description,
        a.account_name,
        cat.category_name,
        STRING_AGG(tags.name, ' ') as tag_names,
        -- Поисковый индекс
        setweight(to_tsvector('russian', COALESCE(t.description, '')), 'A') ||
        setweight(to_tsvector('russian', a.account_name), 'B') ||
        setweight(to_tsvector('russian', cat.category_name), 'C') ||
        setweight(to_tsvector('russian', COALESCE(STRING_AGG(tags.name, ' '), '')), 'D') as search_vector
      FROM "Transactions" t
      JOIN "Accounts" a ON t.account_id = a.id
      JOIN "Categories" cat ON t.category_id = cat.id
      LEFT JOIN "TransactionTags" tt ON t.id = tt.transaction_id
      LEFT JOIN "Tags" tags ON tt.tag_id = tags.id
      WHERE t."deletedAt" IS NULL
      GROUP BY t.id, t.user_id, t.amount, t.transaction_type, 
               t.transaction_date, t.description, a.account_name, cat.category_name;
    `);
    
    console.log('Database views created successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Dropping database views...');
    
    try {
      // Drop each view/materialized view with proper error handling
      const dropStatements = [
        'DROP VIEW IF EXISTS transaction_search_view CASCADE',
        'DROP VIEW IF EXISTS budget_progress_view CASCADE',
        'DROP MATERIALIZED VIEW IF EXISTS monthly_expense_summary_mv CASCADE',
        'DROP VIEW IF EXISTS user_balance_summary_view CASCADE',
        'DROP VIEW IF EXISTS transaction_details_view CASCADE'
      ];
      
      for (const statement of dropStatements) {
        try {
          await queryInterface.sequelize.query(statement);
          console.log(`✓ ${statement}`);
        } catch (error) {
          console.log(`⚠️ Error with ${statement}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log('⚠️ Error dropping views, but continuing:', error.message);
    }
    
    console.log('Database views dropped!');
  }
};
