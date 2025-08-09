'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Adding missing user_id column to Categories...');
    
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('Categories');
    
    if (!tableDescription.user_id) {
      await queryInterface.addColumn('Categories', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'NULL for system categories, user ID for custom categories'
      });
      
      console.log('user_id column added successfully!');
    } else {
      console.log('user_id column already exists, skipping...');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Categories', 'user_id');
  }
};