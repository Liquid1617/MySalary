'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the NOT NULL constraint on category_id
    await queryInterface.sequelize.query(
      'ALTER TABLE "Transactions" ALTER COLUMN "category_id" DROP NOT NULL;'
    );
    
    console.log('✅ Successfully removed NOT NULL constraint from category_id');
  },

  async down(queryInterface, Sequelize) {
    // Add back the NOT NULL constraint (only if no transfer transactions exist)
    const [results] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Transactions" WHERE "category_id" IS NULL;'
    );
    
    if (results[0].count > 0) {
      throw new Error('Cannot add NOT NULL constraint: there are transactions with NULL category_id');
    }
    
    await queryInterface.sequelize.query(
      'ALTER TABLE "Transactions" ALTER COLUMN "category_id" SET NOT NULL;'
    );
    
    console.log('✅ Successfully added back NOT NULL constraint to category_id');
  }
};