'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала удаляем триггер
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS check_category_consistency_trigger ON "Transactions";
    `);
    
    // Потом удаляем функцию
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS check_category_transaction_consistency();
    `);
    
    // Создаем функцию заново с правильным сравнением типов
    await queryInterface.sequelize.query(`
      CREATE FUNCTION check_category_transaction_consistency()
      RETURNS trigger AS $$
      DECLARE
        cat_type text;
      BEGIN
        -- Получаем category_type для данной категории
        SELECT category_type INTO cat_type
        FROM "Categories"
        WHERE id = NEW.category_id;
        
        -- Проверяем согласованность (явно приводим enum к тексту)
        IF cat_type != NEW.transaction_type::text THEN
          RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', cat_type, NEW.transaction_type::text;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Создаем триггер заново
    await queryInterface.sequelize.query(`
      CREATE TRIGGER check_category_consistency_trigger
      BEFORE INSERT OR UPDATE ON "Transactions"
      FOR EACH ROW
      EXECUTE FUNCTION check_category_transaction_consistency();
    `);
    
    console.log('Force-recreated category-transaction consistency check function');
  },

  async down(queryInterface, Sequelize) {
    // Удаляем триггер
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS check_category_consistency_trigger ON "Transactions";
    `);
    
    // Удаляем функцию
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS check_category_transaction_consistency();
    `);
    
    console.log('Removed force-recreated function');
  }
}; 