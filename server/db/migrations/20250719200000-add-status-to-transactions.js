'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add status column with default 'posted'
    await queryInterface.addColumn('Transactions', 'status', {
      type: Sequelize.ENUM('scheduled', 'posted'),
      defaultValue: 'posted',
      allowNull: false
    });

    // Add confirmed_at column
    await queryInterface.addColumn('Transactions', 'confirmed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Create index for efficient queries
    await queryInterface.addIndex('Transactions', ['status', 'transaction_date'], {
      name: 'idx_transactions_status_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('Transactions', 'idx_transactions_status_date');
    
    // Remove columns
    await queryInterface.removeColumn('Transactions', 'confirmed_at');
    await queryInterface.removeColumn('Transactions', 'status');
    
    // Remove enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Transactions_status";');
  }
};