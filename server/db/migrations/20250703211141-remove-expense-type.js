'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Removing expense_type field...');
    
    // 1. Удаляем представления, которые используют expense_type
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS transaction_details_view;');
    
    // 2. Пересоздаем transaction_details_view без expense_type
    await queryInterface.sequelize.query(`
      CREATE VIEW transaction_details_view AS
      SELECT 
        t.id,
        t.user_id,
        t.account_id,
        t.category_id,
        t.amount,
        t.transaction_type,
        t.description,
        t.transaction_date,
        t.is_recurring,
        t.parent_transaction_id,
        t."createdAt",
        t."updatedAt",
        u.login as user_login,
        a.account_name,
        cur.code as currency_code,
        cat.category_name,
        cat.category_type,
        CASE 
          WHEN t.parent_transaction_id IS NOT NULL THEN 'Повторяющаяся'
          WHEN t.is_recurring = true THEN 'Основная повторяющаяся'
          ELSE 'Обычная'
        END as transaction_category
      FROM "Transactions" t
      JOIN "Users" u ON t.user_id = u.id
      JOIN "Accounts" a ON t.account_id = a.id
      JOIN "Categories" cat ON t.category_id = cat.id
      JOIN "Currencies" cur ON a.currency_id = cur.id
      WHERE t."deletedAt" IS NULL;
    `);
    
    // 3. Пересоздаем архивную таблицу без expense_type
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS "TransactionsArchive";');
    
    await queryInterface.sequelize.query(`
      CREATE TABLE "TransactionsArchive" (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
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
    
    // 4. Обновляем функцию create_recurring_transactions
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
              description, transaction_date, is_recurring,
              parent_transaction_id, "createdAt", "updatedAt"
            ) VALUES (
              recurring_transaction.user_id,
              recurring_transaction.account_id,
              recurring_transaction.category_id,
              recurring_transaction.amount,
              recurring_transaction.transaction_type,
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
    
    // 5. Обновляем функцию archive_old_transactions
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
          description, transaction_date, is_recurring,
          parent_transaction_id, "createdAt", "updatedAt", "deletedAt"
        )
        SELECT 
          t.id, t.user_id, t.account_id, t.category_id, t.amount, t.transaction_type,
          t.description, t.transaction_date, t.is_recurring,
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
    
    console.log('expense_type field removed successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Restoring expense_type field...');
    
    // 1. Добавляем поле expense_type обратно
    await queryInterface.addColumn('Transactions', 'expense_type', {
      type: Sequelize.ENUM('deposit', 'debt'),
      allowNull: true
    });
    
    // 2. Удаляем и пересоздаем представления с expense_type
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS transaction_details_view;');
    
    await queryInterface.sequelize.query(`
      CREATE VIEW transaction_details_view AS
      SELECT 
        t.id,
        t.user_id,
        t.account_id,
        t.category_id,
        t.amount,
        t.transaction_type,
        t.expense_type,
        t.description,
        t.transaction_date,
        t.is_recurring,
        t.parent_transaction_id,
        t."createdAt",
        t."updatedAt",
        u.login as user_login,
        a.account_name,
        cur.code as currency_code,
        cat.category_name,
        cat.category_type,
        CASE 
          WHEN t.parent_transaction_id IS NOT NULL THEN 'Повторяющаяся'
          WHEN t.is_recurring = true THEN 'Основная повторяющаяся'
          ELSE 'Обычная'
        END as transaction_category
      FROM "Transactions" t
      JOIN "Users" u ON t.user_id = u.id
      JOIN "Accounts" a ON t.account_id = a.id
      JOIN "Categories" cat ON t.category_id = cat.id
      JOIN "Currencies" cur ON a.currency_id = cur.id
      WHERE t."deletedAt" IS NULL;
    `);
    
    console.log('expense_type field restored!');
  }
};
