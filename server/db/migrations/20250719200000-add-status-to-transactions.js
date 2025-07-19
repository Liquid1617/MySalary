'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add status column with default 'posted'
    await queryInterface.addColumn('transactions', 'status', {
      type: Sequelize.ENUM('scheduled', 'posted'),
      defaultValue: 'posted',
      allowNull: false
    });

    // Add confirmed_at column
    await queryInterface.addColumn('transactions', 'confirmed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Create index for efficient queries
    await queryInterface.addIndex('transactions', ['status', 'date'], {
      name: 'idx_transactions_status_date'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove index
    await queryInterface.removeIndex('transactions', 'idx_transactions_status_date');
    
    // Remove columns
    await queryInterface.removeColumn('transactions', 'confirmed_at');
    await queryInterface.removeColumn('transactions', 'status');
    
    // Remove enum type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transactions_status";');
  }
};