'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Temporarily removing balance constraints to fix corrupted balances...');
    
    // Временно удаляем constraint на баланс
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE "Accounts" DROP CONSTRAINT IF EXISTS balance_constraint_by_account_type;
      `);
      console.log('✅ Balance constraint temporarily removed');
    } catch (error) {
      console.log('⚠️ Error removing constraint (might not exist):', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('Re-adding balance constraints...');
    
    // Восстанавливаем constraint
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
    
    console.log('✅ Balance constraint restored');
  }
};