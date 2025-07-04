'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Adding soft delete support...');
    
    // Добавляем deletedAt ко всем важным таблицам
    const tablesToUpdate = ['Users', 'Accounts', 'Transactions', 'Budgets'];
    
    for (const tableName of tablesToUpdate) {
      // Добавляем поле deletedAt
      await queryInterface.addColumn(tableName, 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      // Добавляем индекс для deleted записей
      await queryInterface.addIndex(tableName, ['deletedAt'], {
        name: `idx_${tableName.toLowerCase()}_deleted_at`
      });
      
      // Добавляем частичный индекс для активных записей (deletedAt IS NULL)
      await queryInterface.sequelize.query(`
        CREATE INDEX idx_${tableName.toLowerCase()}_active
        ON "${tableName}" (id)
        WHERE "deletedAt" IS NULL;
      `);
    }
    
    // Создаем функцию для автоматической установки deletedAt
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION set_deleted_at()
      RETURNS trigger AS $$
      BEGIN
        NEW."deletedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Создаем функцию для восстановления записей
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION restore_record()
      RETURNS trigger AS $$
      BEGIN
        NEW."deletedAt" = NULL;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('Soft delete support added successfully!');
  },

  async down(queryInterface, Sequelize) {
    console.log('Removing soft delete support...');
    
    const tablesToUpdate = ['Users', 'Accounts', 'Transactions', 'Budgets'];
    
    // Удаляем функции
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS set_deleted_at();');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS restore_record();');
    
    for (const tableName of tablesToUpdate) {
      // Удаляем индексы
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_${tableName.toLowerCase()}_deleted_at;`);
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS idx_${tableName.toLowerCase()}_active;`);
      
      // Удаляем поле deletedAt
      await queryInterface.removeColumn(tableName, 'deletedAt');
    }
    
    console.log('Soft delete support removed!');
  }
};
