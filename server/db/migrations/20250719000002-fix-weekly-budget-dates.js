'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Get all weekly budgets
      const weeklyBudgets = await queryInterface.sequelize.query(
        `SELECT id, created_at, custom_start_date, custom_end_date 
         FROM "Budgets" 
         WHERE period_type = 'week'`,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      console.log(`Found ${weeklyBudgets.length} weekly budgets to fix`);

      for (const budget of weeklyBudgets) {
        // Recalculate proper week boundaries for each budget
        const createdDate = new Date(budget.created_at);
        const day = createdDate.getDay();
        
        // Calculate days to subtract to get to Monday of that week
        const daysToMonday = day === 0 ? 6 : day - 1;
        
        const startOfWeek = new Date(createdDate);
        startOfWeek.setDate(createdDate.getDate() - daysToMonday);
        startOfWeek.setUTCHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setUTCHours(23, 59, 59, 999);
        
        console.log(`Budget ID ${budget.id}:`);
        console.log(`  Created: ${createdDate.toDateString()} (day: ${day})`);
        console.log(`  Old: ${budget.custom_start_date} to ${budget.custom_end_date}`);
        console.log(`  New: ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);
        
        // Update the budget with correct dates
        await queryInterface.sequelize.query(
          `UPDATE "Budgets" 
           SET custom_start_date = :startDate, 
               custom_end_date = :endDate,
               updated_at = NOW()
           WHERE id = :budgetId`,
          {
            replacements: {
              startDate: startOfWeek.toISOString(),
              endDate: endOfWeek.toISOString(),
              budgetId: budget.id
            },
            transaction
          }
        );
      }

      await transaction.commit();
      console.log('Weekly budget dates migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // This migration cannot be easily reversed since we don't know the original incorrect dates
    console.log('This migration cannot be reversed - weekly budget dates have been corrected');
  }
};