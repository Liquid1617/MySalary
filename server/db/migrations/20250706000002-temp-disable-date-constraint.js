'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Временно отключаем constraint на дату
    await queryInterface.sequelize.query(`
      ALTER TABLE "Transactions" DROP CONSTRAINT IF EXISTS "transaction_date_not_future";
    `);
    
    console.log('Temporarily disabled transaction_date_not_future constraint');
  },

  async down(queryInterface, Sequelize) {
    // Возвращаем constraint на дату
    await queryInterface.sequelize.query(`
      ALTER TABLE "Transactions" ADD CONSTRAINT "transaction_date_not_future" 
      CHECK (transaction_date <= CURRENT_DATE);
    `);
    
    console.log('Re-enabled transaction_date_not_future constraint');
  }
}; 