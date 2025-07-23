'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if 'transfer' value already exists in enum
    const [results] = await queryInterface.sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'enum_Transactions_transaction_type'
      ) 
      AND enumlabel = 'transfer';
    `);
    
    if (results.length === 0) {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_Transactions_transaction_type" ADD VALUE 'transfer';
      `);
      
      console.log('✅ Added "transfer" value to transaction_type enum');
    } else {
      console.log('⚠️ "transfer" value already exists in transaction_type enum');
    }
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum and updating all references
    console.log('⚠️ Cannot remove enum value "transfer" - this migration is not reversible');
  }
};
