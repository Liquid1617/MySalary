'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🗓️ Removing future date constraint to allow scheduled transactions...');
    
    // Удаляем ограничение, запрещающее будущие даты
    await queryInterface.removeConstraint('Transactions', 'transaction_date_not_future');
    
    console.log('✅ Future date constraint removed - scheduled transactions now allowed');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔒 Re-adding future date constraint...');
    
    // Восстанавливаем ограничение (rollback)
    await queryInterface.addConstraint('Transactions', {
      fields: ['transaction_date'],
      type: 'check',
      name: 'transaction_date_not_future',
      where: {
        transaction_date: { [Sequelize.Op.lte]: Sequelize.literal('CURRENT_DATE') }
      }
    });
    
    console.log('✅ Future date constraint restored');
  }
};