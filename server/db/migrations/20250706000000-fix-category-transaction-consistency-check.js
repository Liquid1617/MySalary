'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Пересоздаем функцию с правильным сравнением типов
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
        
        -- Проверяем согласованность (приводим enum к тексту)
        IF cat_type != NEW.transaction_type::text THEN
          RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', cat_type, NEW.transaction_type;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('Fixed category-transaction consistency check function');
  },

  async down(queryInterface, Sequelize) {
    // Возвращаем старую версию функции
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
        
        -- Проверяем согласованность (старая неправильная версия)
        IF cat_type != NEW.transaction_type THEN
          RAISE EXCEPTION 'Category type (%) does not match transaction type (%)', cat_type, NEW.transaction_type;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('Reverted category-transaction consistency check function');
  }
}; 