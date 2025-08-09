'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Fixing audit trigger enum type issue...');
    
    // Пересоздаем функцию аудита с явным приведением типа
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
        
        -- Записываем в аудит лог с явным приведением типа
        INSERT INTO "AuditLog" (
          table_name, record_id, operation, 
          old_values, new_values, "createdAt"
        ) VALUES (
          table_name_var, record_id_var, operation_var::"enum_AuditLog_operation",
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
    
    console.log('Audit trigger enum type issue fixed!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Reverting audit trigger to original version...');
    
    // Возвращаем оригинальную функцию
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
    
    console.log('Audit trigger reverted!');
  }
};