'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make category_id nullable to support transfer transactions
    await queryInterface.changeColumn('Transactions', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    
    console.log('✅ Made category_id nullable for transfer transactions');
  },

  async down(queryInterface, Sequelize) {
    // Revert to NOT NULL (only if no transfer transactions exist)
    await queryInterface.changeColumn('Transactions', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    
    console.log('✅ Reverted category_id to NOT NULL');
  }
};
