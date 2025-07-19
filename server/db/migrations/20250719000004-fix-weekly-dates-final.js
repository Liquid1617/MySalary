'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Update specific weekly budget with correct dates
      // Based on July 2025 calendar:
      // Week should be: Monday July 14 - Sunday July 20
      
      const result = await queryInterface.sequelize.query(
        `UPDATE "Budgets" 
         SET custom_start_date = '2025-07-14',
             custom_end_date = '2025-07-20',
             updated_at = NOW()
         WHERE period_type = 'week' AND id = 3`,
        { transaction }
      );

      console.log('Fixed weekly budget to correct dates: Monday July 14 - Sunday July 20');
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('This migration cannot be reversed');
  }
};