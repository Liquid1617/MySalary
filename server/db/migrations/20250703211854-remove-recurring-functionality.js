'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Removing recurring functionality...');
    
    // 1. Удаляем представления, которые используют поля
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS transaction_details_view;');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS budget_progress_view;');
    
    // 2. Удаляем функцию создания повторяющихся транзакций
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS create_recurring_transactions();');
    
    // 3. Удаляем индексы связанные с parent_transaction_id
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS transactions_parent_transaction_id;');
    
    // 4. Пересоздаем transaction_details_view без удаленных полей
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
        t."createdAt",
        t."updatedAt",
        u.login as user_login,
        a.account_name,
        cur.code as currency_code,
        cat.category_name,
        cat.category_type,
        'Обычная' as transaction_category
      FROM "Transactions" t
      JOIN "Users" u ON t.user_id = u.id
      JOIN "Accounts" a ON t.account_id = a.id
      JOIN "Categories" cat ON t.category_id = cat.id
      JOIN "Currencies" cur ON a.currency_id = cur.id
      WHERE t."deletedAt" IS NULL;
    `);
    
    // 5. Пересоздаем budget_progress_view без удаленных полей
    await queryInterface.sequelize.query(`
      CREATE VIEW budget_progress_view AS
      SELECT 
        b.id,
        b.user_id,
        b.category_id,
        b.planned_amount as budget_amount,
        b.start_date,
        b.end_date,
        b.is_active,
        cat.category_name,
        cat.category_type,
        COALESCE(SUM(t.amount), 0) as spent_amount,
        b.planned_amount - COALESCE(SUM(t.amount), 0) as remaining_amount,
        CASE 
          WHEN b.planned_amount > 0 THEN 
            ROUND((COALESCE(SUM(t.amount), 0) / b.planned_amount * 100), 2)
          ELSE 0 
        END as usage_percentage,
        CASE 
          WHEN COALESCE(SUM(t.amount), 0) > b.planned_amount THEN 'Превышен'
          WHEN COALESCE(SUM(t.amount), 0) >= b.planned_amount * 0.9 THEN 'Близко к лимиту'
          WHEN COALESCE(SUM(t.amount), 0) >= b.planned_amount * 0.7 THEN 'Умеренное использование'
          ELSE 'В пределах нормы'
        END as budget_status
      FROM "Budgets" b
      JOIN "Categories" cat ON b.category_id = cat.id
      LEFT JOIN "Transactions" t ON b.category_id = t.category_id 
        AND t.user_id = b.user_id
        AND t.transaction_type = 'expense'
        AND t.transaction_date >= b.start_date
        AND t.transaction_date <= b.end_date
        AND t."deletedAt" IS NULL
      WHERE b."deletedAt" IS NULL
      GROUP BY b.id, b.user_id, b.category_id, b.planned_amount, 
               b.start_date, b.end_date, b.is_active, 
               cat.category_name, cat.category_type;
    `);
    
    // 6. Пересоздаем архивную таблицу без удаленных полей
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
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL,
        "deletedAt" TIMESTAMP,
        "archivedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Индексы для архивной таблицы
    await queryInterface.addIndex('TransactionsArchive', ['user_id', 'transaction_date']);
    await queryInterface.addIndex('TransactionsArchive', ['archivedAt']);
    
    // 7. Обновляем функцию archive_old_transactions
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
          description, transaction_date, "createdAt", "updatedAt", "deletedAt"
        )
        SELECT 
          t.id, t.user_id, t.account_id, t.category_id, t.amount, t.transaction_type,
          t.description, t.transaction_date, t."createdAt", t."updatedAt", t."deletedAt"
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
    
    console.log('Recurring functionality removed successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Restoring recurring functionality...');
    
    // 1. Добавляем поля обратно
    await queryInterface.addColumn('Transactions', 'is_recurring', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    
    await queryInterface.addColumn('Transactions', 'parent_transaction_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Transactions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    
    // 2. Восстанавливаем индексы
    await queryInterface.addIndex('Transactions', ['parent_transaction_id'], {
      name: 'transactions_parent_transaction_id',
      where: {
        parent_transaction_id: {
          [Sequelize.Op.ne]: null
        }
      }
    });
    
    // 3. Восстанавливаем функцию create_recurring_transactions
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
              false,
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
    
    console.log('Recurring functionality restored!');
  }
};
