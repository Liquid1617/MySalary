'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column already exists
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Transactions' 
      AND column_name = 'transfer_to';
    `);
    
    if (results.length === 0) {
      await queryInterface.addColumn('Transactions', 'transfer_to', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      });
      
      console.log('✅ Added transfer_to column to Transactions table');
    } else {
      console.log('⚠️ transfer_to column already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Transactions', 'transfer_to');
  }
};