'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get all weekly budgets that might have Saturday as end date instead of Sunday
      const weeklyBudgets = await queryInterface.sequelize.query(
        `SELECT id, custom_start_date, custom_end_date 
         FROM "Budgets" 
         WHERE period_type = 'week'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      console.log(`Found ${weeklyBudgets.length} weekly budgets to check end dates`);

      for (const budget of weeklyBudgets) {
        const startDate = new Date(budget.custom_start_date);
        const currentEndDate = new Date(budget.custom_end_date);
        
        // Calculate correct Sunday (6 days after Monday)
        const correctEndDate = new Date(startDate);
        correctEndDate.setDate(startDate.getDate() + 6);
        correctEndDate.setUTCHours(23, 59, 59, 999);
        
        // Check if end date needs correction
        const currentEndDay = new Date(budget.custom_end_date).getUTCDay();
        
        console.log(`Budget ID ${budget.id}:`);
        console.log(`  Start: ${startDate.toDateString()}`);
        console.log(`  Current end: ${currentEndDate.toDateString()} (day: ${currentEndDay})`);
        console.log(`  Correct end: ${correctEndDate.toDateString()} (day: ${correctEndDate.getUTCDay()})`);
        
        // Update if current end is not Sunday (day 0)
        if (currentEndDay !== 0) {
          await queryInterface.sequelize.query(
            `UPDATE "Budgets" 
             SET custom_end_date = :endDate,
                 updated_at = NOW()
             WHERE id = :budgetId`,
            {
              replacements: {
                endDate: correctEndDate.toISOString(),
                budgetId: budget.id
              },
              transaction
            }
          );
          console.log(`  Updated to: ${correctEndDate.toISOString()}`);
        } else {
          console.log(`  Already correct (Sunday)`);
        }
      }

      await transaction.commit();
      console.log('Weekly budget end dates migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('This migration cannot be reversed - weekly budget end dates have been corrected');
  }
};