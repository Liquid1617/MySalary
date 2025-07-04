'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Adding maintenance and optimization features...');
    
    // 1. STORED PROCEDURES ДЛЯ СЛОЖНЫХ ЗАПРОСОВ
    
    // Функция для получения финансовой сводки пользователя
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION get_user_financial_summary(
        p_user_id INTEGER,
        p_start_date DATE DEFAULT NULL,
        p_end_date DATE DEFAULT NULL
      )
      RETURNS TABLE (
        total_income DECIMAL(15,2),
        total_expenses DECIMAL(15,2),
        net_amount DECIMAL(15,2),
        total_accounts INTEGER,
        total_balance DECIMAL(15,2),
        top_expense_category TEXT,
        transaction_count INTEGER
      ) AS $$
      BEGIN
        RETURN QUERY
        WITH income_summary AS (
          SELECT COALESCE(SUM(t.amount), 0) as total_income_amount
          FROM "Transactions" t
          WHERE t.user_id = p_user_id
            AND t.transaction_type = 'income'
            AND t."deletedAt" IS NULL
            AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
            AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
        ),
        expense_summary AS (
          SELECT 
            COALESCE(SUM(t.amount), 0) as total_expense_amount,
            COUNT(t.id) as expense_count
          FROM "Transactions" t
          WHERE t.user_id = p_user_id
            AND t.transaction_type = 'expense'
            AND t."deletedAt" IS NULL
            AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
            AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
        ),
        account_summary AS (
          SELECT 
            COUNT(a.id) as account_count,
            COALESCE(SUM(a.balance), 0) as total_balance_amount
          FROM "Accounts" a
          WHERE a.user_id = p_user_id
            AND a.is_active = true
            AND a."deletedAt" IS NULL
        ),
        top_category AS (
          SELECT cat.category_name
          FROM "Transactions" t
          JOIN "Categories" cat ON t.category_id = cat.id
          WHERE t.user_id = p_user_id
            AND t.transaction_type = 'expense'
            AND t."deletedAt" IS NULL
            AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
            AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
          GROUP BY cat.category_name
          ORDER BY SUM(t.amount) DESC
          LIMIT 1
        ),
        total_transactions AS (
          SELECT COUNT(t.id) as transaction_count
          FROM "Transactions" t
          WHERE t.user_id = p_user_id
            AND t."deletedAt" IS NULL
            AND (p_start_date IS NULL OR t.transaction_date >= p_start_date)
            AND (p_end_date IS NULL OR t.transaction_date <= p_end_date)
        )
        SELECT 
          i.total_income_amount,
          e.total_expense_amount,
          i.total_income_amount - e.total_expense_amount,
          a.account_count::INTEGER,
          a.total_balance_amount,
          COALESCE(tc.category_name, 'Нет расходов'),
          tt.transaction_count::INTEGER
        FROM income_summary i
        CROSS JOIN expense_summary e
        CROSS JOIN account_summary a
        LEFT JOIN top_category tc ON true
        CROSS JOIN total_transactions tt;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Функция для автоматического создания повторяющихся транзакций
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION create_recurring_transactions()
      RETURNS INTEGER AS $$
      DECLARE
        recurring_transaction RECORD;
        created_count INTEGER := 0;
        next_date DATE;
      BEGIN
        FOR recurring_transaction IN
          SELECT t.*, 
                 CASE 
                   WHEN t.description LIKE '%ежемесячно%' THEN t.transaction_date + INTERVAL '1 month'
                   WHEN t.description LIKE '%еженедельно%' THEN t.transaction_date + INTERVAL '1 week'
                   ELSE t.transaction_date + INTERVAL '1 month'
                 END as next_transaction_date
          FROM "Transactions" t
          WHERE t.is_recurring = true
            AND t."deletedAt" IS NULL
            AND t.transaction_date <= CURRENT_DATE - INTERVAL '1 month'
        LOOP
          next_date := recurring_transaction.next_transaction_date;
          
          -- Проверяем, что такой транзакции еще нет
          IF NOT EXISTS (
            SELECT 1 FROM "Transactions" 
            WHERE user_id = recurring_transaction.user_id
              AND account_id = recurring_transaction.account_id
              AND category_id = recurring_transaction.category_id
              AND amount = recurring_transaction.amount
              AND transaction_date = next_date
              AND parent_transaction_id = recurring_transaction.id
          ) THEN
            INSERT INTO "Transactions" (
              user_id, account_id, category_id, amount, transaction_type,
              expense_type, description, transaction_date, is_recurring,
              parent_transaction_id, "createdAt", "updatedAt"
            ) VALUES (
              recurring_transaction.user_id,
              recurring_transaction.account_id,
              recurring_transaction.category_id,
              recurring_transaction.amount,
              recurring_transaction.transaction_type,
              recurring_transaction.expense_type,
              CONCAT('Автоматически создано: ', recurring_transaction.description),
              next_date,
              false, -- новая транзакция не повторяющаяся
              recurring_transaction.id,
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            );
            created_count := created_count + 1;
          END IF;
        END LOOP;
        
        RETURN created_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // 2. ФУНКЦИИ АРХИВИРОВАНИЯ
    
    // Создаем таблицу архива транзакций
    await queryInterface.sequelize.query(`
      CREATE TABLE "TransactionsArchive" (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
        expense_type VARCHAR(10) CHECK (expense_type IN ('deposit', 'debt')),
        description VARCHAR(255),
        transaction_date DATE NOT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT false,
        parent_transaction_id INTEGER,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        "deletedAt" TIMESTAMP,
        "archivedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Индексы для архивной таблицы
    await queryInterface.addIndex('TransactionsArchive', ['user_id', 'transaction_date']);
    await queryInterface.addIndex('TransactionsArchive', ['archivedAt']);
    
    // Функция архивирования старых транзакций
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION archive_old_transactions(
        p_months_old INTEGER DEFAULT 12
      )
      RETURNS INTEGER AS $$
      DECLARE
        archived_count INTEGER := 0;
        cutoff_date DATE := CURRENT_DATE - CONCAT(p_months_old, ' months')::INTERVAL;
      BEGIN
        -- Копируем старые транзакции в архив
        INSERT INTO "TransactionsArchive" (
          id, user_id, account_id, category_id, amount, transaction_type,
          expense_type, description, transaction_date, is_recurring,
          parent_transaction_id, "createdAt", "updatedAt", "deletedAt"
        )
        SELECT 
          t.id, t.user_id, t.account_id, t.category_id, t.amount, t.transaction_type,
          t.expense_type, t.description, t.transaction_date, t.is_recurring,
          t.parent_transaction_id, t."createdAt", t."updatedAt", t."deletedAt"
        FROM "Transactions" t
        WHERE t.transaction_date < cutoff_date
          AND NOT EXISTS (
            SELECT 1 FROM "TransactionsArchive" ta 
            WHERE ta.id = t.id
          );
        
        GET DIAGNOSTICS archived_count = ROW_COUNT;
        
        -- Удаляем заархивированные транзакции из основной таблицы
        DELETE FROM "Transactions" 
        WHERE transaction_date < cutoff_date;
        
        RETURN archived_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // 3. ФУНКЦИИ ОБСЛУЖИВАНИЯ
    
    // Функция обновления статистики
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION refresh_database_statistics()
      RETURNS TEXT AS $$
      DECLARE
        result_text TEXT := '';
      BEGIN
        -- Обновляем статистику таблиц
        ANALYZE "Users";
        ANALYZE "Accounts";
        ANALYZE "Transactions";
        ANALYZE "Categories";
        ANALYZE "Budgets";
        
        result_text := CONCAT(result_text, 'Statistics updated. ');
        
        -- Обновляем материализованные представления
        REFRESH MATERIALIZED VIEW monthly_expense_summary_mv;
        result_text := CONCAT(result_text, 'Materialized views refreshed. ');
        
        -- Очистка неиспользуемых данных
        VACUUM (ANALYZE, VERBOSE) "Transactions";
        result_text := CONCAT(result_text, 'Vacuum completed.');
        
        RETURN result_text;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Функция очистки старых логов аудита
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
        p_days_old INTEGER DEFAULT 365
      )
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER := 0;
        cutoff_date TIMESTAMP := CURRENT_TIMESTAMP - CONCAT(p_days_old, ' days')::INTERVAL;
      BEGIN
        DELETE FROM "AuditLog" 
        WHERE "createdAt" < cutoff_date;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // 4. СОЗДАЕМ ЗАДАЧИ ПЛАНИРОВЩИКА (для PostgreSQL с pg_cron)
    
    // Примечание: требует расширения pg_cron
    // Ежедневная задача обновления статистики в 2:00
    // SELECT cron.schedule('refresh-stats', '0 2 * * *', 'SELECT refresh_database_statistics();');
    
    // Еженедельная задача создания повторяющихся транзакций
    // SELECT cron.schedule('create-recurring', '0 1 * * 1', 'SELECT create_recurring_transactions();');
    
    // Ежемесячная задача очистки логов
    // SELECT cron.schedule('cleanup-logs', '0 3 1 * *', 'SELECT cleanup_old_audit_logs();');
    
    // Ежегодная задача архивирования
    // SELECT cron.schedule('archive-transactions', '0 4 1 1 *', 'SELECT archive_old_transactions();');
    
    console.log('Maintenance and optimization features added successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing maintenance and optimization features...');
    
    // Удаляем функции
    const functionsToRemove = [
      'get_user_financial_summary',
      'create_recurring_transactions',
      'archive_old_transactions',
      'refresh_database_statistics',
      'cleanup_old_audit_logs'
    ];
    
    for (const functionName of functionsToRemove) {
      await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS ${functionName};`);
    }
    
    // Удаляем архивную таблицу
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "TransactionsArchive";');
    
    console.log('Maintenance and optimization features removed!');
  }
};
