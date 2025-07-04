'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Adding audit log and constraints...');
    
    // 1. СОЗДАЕМ ТАБЛИЦУ АУДИТА
    await queryInterface.createTable('AuditLog', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      table_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      record_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      operation: {
        type: Sequelize.ENUM('INSERT', 'UPDATE', 'DELETE'),
        allowNull: false
      },
      old_values: {
        type: Sequelize.JSONB
      },
      new_values: {
        type: Sequelize.JSONB
      },
      changed_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      ip_address: {
        type: Sequelize.INET
      },
      user_agent: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    // Индексы для таблицы аудита
    await queryInterface.addIndex('AuditLog', ['table_name', 'record_id']);
    await queryInterface.addIndex('AuditLog', ['operation']);
    await queryInterface.addIndex('AuditLog', ['createdAt']);
    await queryInterface.addIndex('AuditLog', ['changed_by']);
    
    // 2. ДОБАВЛЯЕМ CHECK CONSTRAINTS
    
    // Constraints для Accounts
    await queryInterface.addConstraint('Accounts', {
      fields: ['balance', 'account_type'],
      type: 'check',
      name: 'balance_constraint_by_account_type',
      where: {
        [Sequelize.Op.or]: [
          // Дебетовые карты и банковские счета не могут иметь отрицательный баланс
          {
            account_type: ['debit_card', 'bank_account', 'cash', 'digital_wallet'],
            balance: { [Sequelize.Op.gte]: 0 }
          },
          // Кредитные карты могут иметь отрицательный баланс
          {
            account_type: 'credit_card'
          }
        ]
      }
    });
    
    // Constraints для Transactions
    await queryInterface.addConstraint('Transactions', {
      fields: ['amount'],
      type: 'check',
      name: 'positive_amount',
      where: {
        amount: { [Sequelize.Op.gt]: 0 }
      }
    });
    
    await queryInterface.addConstraint('Transactions', {
      fields: ['transaction_date'],
      type: 'check',
      name: 'transaction_date_not_future',
      where: {
        transaction_date: { [Sequelize.Op.lte]: Sequelize.literal('CURRENT_DATE') }
      }
    });
    
    // Constraints для Budgets
    await queryInterface.addConstraint('Budgets', {
      fields: ['start_date', 'end_date'],
      type: 'check',
      name: 'budget_date_order',
      where: Sequelize.literal('"start_date" < "end_date"')
    });
    
    await queryInterface.addConstraint('Budgets', {
      fields: ['planned_amount'],
      type: 'check',
      name: 'positive_planned_amount',
      where: {
        planned_amount: { [Sequelize.Op.gt]: 0 }
      }
    });
    
    // Constraints для Users
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'check',
      name: 'valid_email_format',
      where: Sequelize.literal("email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'")
    });
    
    await queryInterface.addConstraint('Users', {
      fields: ['phone'],
      type: 'check',
      name: 'valid_phone_format',
      where: Sequelize.literal("phone IS NULL OR phone ~* '^\\+?[1-9]\\d{1,14}$'")
    });
    
    // Constraints для Tags
    await queryInterface.addConstraint('Tags', {
      fields: ['color'],
      type: 'check',
      name: 'valid_color_format',
      where: Sequelize.literal("color IS NULL OR color ~* '^#[0-9A-Fa-f]{6}$'")
    });
    
    // 3. СОЗДАЕМ ФУНКЦИЮ АУДИТА
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION audit_trigger_function()
      RETURNS trigger AS $$
      DECLARE
        table_name_var text := TG_TABLE_NAME;
        operation_var text := TG_OP;
        record_id_var integer;
        old_values_var jsonb;
        new_values_var jsonb;
      BEGIN
        -- Определяем ID записи и значения
        IF operation_var = 'DELETE' THEN
          record_id_var := OLD.id;
          old_values_var := to_jsonb(OLD);
          new_values_var := null;
        ELSIF operation_var = 'UPDATE' THEN
          record_id_var := NEW.id;
          old_values_var := to_jsonb(OLD);
          new_values_var := to_jsonb(NEW);
        ELSIF operation_var = 'INSERT' THEN
          record_id_var := NEW.id;
          old_values_var := null;
          new_values_var := to_jsonb(NEW);
        END IF;
        
        -- Записываем в аудит лог
        INSERT INTO "AuditLog" (
          table_name, record_id, operation, 
          old_values, new_values, "createdAt"
        ) VALUES (
          table_name_var, record_id_var, operation_var,
          old_values_var, new_values_var, CURRENT_TIMESTAMP
        );
        
        -- Возвращаем соответствующую запись
        IF operation_var = 'DELETE' THEN
          RETURN OLD;
        ELSE
          RETURN NEW;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // 4. СОЗДАЕМ ТРИГГЕРЫ АУДИТА ДЛЯ ВАЖНЫХ ТАБЛИЦ
    const auditTables = ['Users', 'Accounts', 'Transactions', 'Budgets'];
    
    for (const tableName of auditTables) {
      await queryInterface.sequelize.query(`
        CREATE TRIGGER audit_trigger_${tableName.toLowerCase()}
        AFTER INSERT OR UPDATE OR DELETE ON "${tableName}"
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
      `);
    }
    
    // 5. СОЗДАЕМ ФУНКЦИЮ ДЛЯ ОБНОВЛЕНИЯ БАЛАНСОВ
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_account_balance()
      RETURNS trigger AS $$
      DECLARE
        balance_change decimal(15,2);
      BEGIN
        -- Вычисляем изменение баланса
        IF TG_OP = 'INSERT' THEN
          IF NEW.transaction_type = 'income' THEN
            balance_change := NEW.amount;
          ELSE
            balance_change := -NEW.amount;
          END IF;
          
          -- Обновляем баланс счета
          UPDATE "Accounts" 
          SET balance = balance + balance_change,
              "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = NEW.account_id;
          
        ELSIF TG_OP = 'UPDATE' THEN
          -- Откатываем старое изменение
          IF OLD.transaction_type = 'income' THEN
            balance_change := -OLD.amount;
          ELSE
            balance_change := OLD.amount;
          END IF;
          
          -- Применяем новое изменение
          IF NEW.transaction_type = 'income' THEN
            balance_change := balance_change + NEW.amount;
          ELSE
            balance_change := balance_change - NEW.amount;
          END IF;
          
          UPDATE "Accounts" 
          SET balance = balance + balance_change,
              "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = NEW.account_id;
          
        ELSIF TG_OP = 'DELETE' THEN
          -- Откатываем изменение при удалении
          IF OLD.transaction_type = 'income' THEN
            balance_change := -OLD.amount;
          ELSE
            balance_change := OLD.amount;
          END IF;
          
          UPDATE "Accounts" 
          SET balance = balance + balance_change,
              "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = OLD.account_id;
        END IF;
        
        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        ELSE
          RETURN NEW;
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Создаем триггер для автоматического обновления балансов
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_balance_trigger
      AFTER INSERT OR UPDATE OR DELETE ON "Transactions"
      FOR EACH ROW EXECUTE FUNCTION update_account_balance();
    `);
    
    console.log('Audit log and constraints added successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing audit log and constraints...');
    
    // Удаляем триггеры
    const auditTables = ['Users', 'Accounts', 'Transactions', 'Budgets'];
    for (const tableName of auditTables) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS audit_trigger_${tableName.toLowerCase()} ON "${tableName}";
      `);
    }
    
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_balance_trigger ON "Transactions";
    `);
    
    // Удаляем функции
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS audit_trigger_function();');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_account_balance();');
    
    // Удаляем constraints
    const constraintsToRemove = [
      'balance_constraint_by_account_type',
      'positive_amount',
      'transaction_date_not_future',
      'budget_date_order',
      'positive_planned_amount',
      'valid_email_format',
      'valid_phone_format',
      'valid_color_format'
    ];
    
    for (const constraintName of constraintsToRemove) {
      try {
        await queryInterface.removeConstraint('Accounts', constraintName);
      } catch (e) {}
      try {
        await queryInterface.removeConstraint('Transactions', constraintName);
      } catch (e) {}
      try {
        await queryInterface.removeConstraint('Budgets', constraintName);
      } catch (e) {}
      try {
        await queryInterface.removeConstraint('Users', constraintName);
      } catch (e) {}
      try {
        await queryInterface.removeConstraint('Tags', constraintName);
      } catch (e) {}
    }
    
    // Удаляем таблицу аудита
    await queryInterface.dropTable('AuditLog');
    
    console.log('Audit log and constraints removed!');
  }
};
