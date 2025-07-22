'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if BudgetCategories table exists
      const [tableExists] = await queryInterface.sequelize.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'BudgetCategories'
        )`,
        { transaction }
      );
      
      if (!tableExists[0].exists) {
        console.log('BudgetCategories table does not exist yet, skipping migration');
        await transaction.commit();
        return;
      }
      
      // Get all BudgetCategories to check for data type issues
      const [budgetCategories] = await queryInterface.sequelize.query(
        'SELECT id, budget_id, category_id FROM "BudgetCategories"',
        { transaction }
      );
      
      console.log(`Found ${budgetCategories.length} BudgetCategory records to validate`);
      
      let cleanedCount = 0;
      let invalidCount = 0;
      
      // Check each record for valid category_id
      for (const bc of budgetCategories) {
        const parsedCategoryId = parseInt(bc.category_id);
        
        // If category_id is not a valid integer or doesn't exist in Categories table
        if (isNaN(parsedCategoryId)) {
          console.log(`Removing BudgetCategory ${bc.id} with invalid category_id: ${bc.category_id}`);
          await queryInterface.sequelize.query(
            'DELETE FROM "BudgetCategories" WHERE id = :id',
            { 
              replacements: { id: bc.id },
              transaction 
            }
          );
          invalidCount++;
          continue;
        }
        
        // Check if the category exists
        const [categoryExists] = await queryInterface.sequelize.query(
          'SELECT id FROM "Categories" WHERE id = :categoryId',
          { 
            replacements: { categoryId: parsedCategoryId },
            transaction 
          }
        );
        
        if (categoryExists.length === 0) {
          console.log(`Removing BudgetCategory ${bc.id} with non-existent category_id: ${parsedCategoryId}`);
          await queryInterface.sequelize.query(
            'DELETE FROM "BudgetCategories" WHERE id = :id',
            { 
              replacements: { id: bc.id },
              transaction 
            }
          );
          invalidCount++;
          continue;
        }
        
        // If category_id is a string but valid integer, convert it
        if (typeof bc.category_id === 'string' && bc.category_id !== parsedCategoryId.toString()) {
          console.log(`Converting BudgetCategory ${bc.id} category_id from "${bc.category_id}" to ${parsedCategoryId}`);
          await queryInterface.sequelize.query(
            'UPDATE "BudgetCategories" SET category_id = :categoryId WHERE id = :id',
            { 
              replacements: { categoryId: parsedCategoryId, id: bc.id },
              transaction 
            }
          );
          cleanedCount++;
        }
      }
      
      // Add CHECK constraint to ensure category_id is always an integer
      await queryInterface.addConstraint('BudgetCategories', {
        fields: ['category_id'],
        type: 'check',
        name: 'check_category_id_integer',
        where: {
          category_id: {
            [Sequelize.Op.and]: [
              { [Sequelize.Op.gte]: 1 },
              { [Sequelize.Op.ne]: null }
            ]
          }
        },
        transaction
      });
      
      console.log(`Migration completed: ${cleanedCount} records cleaned, ${invalidCount} invalid records removed`);
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Check if BudgetCategories table exists
    const [tableExists] = await queryInterface.sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'BudgetCategories'
      )`
    );
    
    if (!tableExists[0].exists) {
      console.log('BudgetCategories table does not exist, skipping down migration');
      return;
    }
    
    // Remove the CHECK constraint
    await queryInterface.removeConstraint('BudgetCategories', 'check_category_id_integer').catch(() => {
      console.log('CHECK constraint does not exist, skipping removal');
    });
    
    // Note: We cannot restore deleted invalid records as they were corrupted data
    console.log('Removed CHECK constraint. Invalid data that was cleaned cannot be restored.');
  }
};