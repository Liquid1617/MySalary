'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем функцию для проверки согласованности category_type и transaction_type
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION check_category_transaction_consistency()
      RETURNS trigger AS $$
      DECLARE
        cat_type text;
      BEGIN
        -- Получаем category_type для данной категории
        SELECT category_type INTO cat_type
        FROM "Categories"
        WHERE id = NEW.category_id;
        
        -- Проверяем согласованность
        IF cat_type != NEW.transaction_type THEN
          RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', cat_type, NEW.transaction_type;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Создаем триггер на таблице Transactions
    await queryInterface.sequelize.query(`
      CREATE TRIGGER check_category_consistency_trigger
      BEFORE INSERT OR UPDATE ON "Transactions"
      FOR EACH ROW
      EXECUTE FUNCTION check_category_transaction_consistency();
    `);
    
    console.log('Added category-transaction consistency check');
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
    
    console.log('Removed category-transaction consistency check');
  }
};
