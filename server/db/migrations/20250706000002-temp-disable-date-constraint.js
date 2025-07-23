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
    // Проверяем, существует ли constraint
    const [constraints] = await queryInterface.sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'Transactions' 
      AND constraint_name = 'transaction_date_not_future';
    `);
    
    if (constraints.length === 0) {
      // Возвращаем constraint на дату только если его нет
      await queryInterface.sequelize.query(`
        ALTER TABLE "Transactions" ADD CONSTRAINT "transaction_date_not_future" 
        CHECK (transaction_date <= CURRENT_DATE);
      `);
      
      console.log('Re-enabled transaction_date_not_future constraint');
    } else {
      console.log('transaction_date_not_future constraint already exists, skipping');
    }
  }
}; 