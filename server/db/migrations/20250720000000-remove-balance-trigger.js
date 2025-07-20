'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Removing duplicate balance trigger...');
    
    // Удаляем триггер который дублирует обновление баланса
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_balance_trigger ON "Transactions";
    `);
    
    // Удаляем функцию триггера
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS update_account_balance();
    `);
    
    console.log('Balance trigger removed successfully!');
  },

  async down(queryInterface, Sequelize) {
    // В down мы НЕ восстанавливаем триггер, так как он создает проблемы
    console.log('This migration is not reversible - balance trigger should not be restored');
  }
};