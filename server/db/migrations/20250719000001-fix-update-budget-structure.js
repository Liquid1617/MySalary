'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, drop the view that depends on Budgets.category_id
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS budget_progress_view CASCADE;');
    
    // Drop the unique index
    await queryInterface.removeIndex('Budgets', 'unique_budget_period').catch(() => {
      console.log('Index unique_budget_period not found, skipping...');
    });
    
    // Remove the foreign key constraint on category_id
    await queryInterface.sequelize.query(`
      ALTER TABLE "Budgets" 
      DROP CONSTRAINT IF EXISTS "Budgets_category_id_fkey";
    `);
    
    // Remove category_id column
    await queryInterface.removeColumn('Budgets', 'category_id');
    
    // Rename planned_amount to limit_amount
    await queryInterface.renameColumn('Budgets', 'planned_amount', 'limit_amount');
    
    // Add name column
    await queryInterface.addColumn('Budgets', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Budget'
    });
    
    // Add currency column
    await queryInterface.addColumn('Budgets', 'currency', {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    });
    
    // Drop the old enum type and create new one
    await queryInterface.sequelize.query(`
      ALTER TABLE "Budgets" ALTER COLUMN period_type DROP DEFAULT;
      ALTER TABLE "Budgets" ALTER COLUMN period_type TYPE VARCHAR(255);
      DROP TYPE IF EXISTS "enum_Budgets_period_type";
      CREATE TYPE "enum_Budgets_period_type" AS ENUM('month', 'week', 'custom');
      ALTER TABLE "Budgets" ALTER COLUMN period_type TYPE "enum_Budgets_period_type" USING period_type::text::"enum_Budgets_period_type";
      ALTER TABLE "Budgets" ALTER COLUMN period_type SET DEFAULT 'month';
    `);
    
    // Make start_date and end_date nullable
    await queryInterface.changeColumn('Budgets', 'start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
    
    await queryInterface.changeColumn('Budgets', 'end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
    
    // Rename date columns
    await queryInterface.renameColumn('Budgets', 'start_date', 'custom_start_date');
    await queryInterface.renameColumn('Budgets', 'end_date', 'custom_end_date');
    
    // Add rollover column
    await queryInterface.addColumn('Budgets', 'rollover', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
    
    // Rename timestamp columns
    await queryInterface.renameColumn('Budgets', 'createdAt', 'created_at');
    await queryInterface.renameColumn('Budgets', 'updatedAt', 'updated_at');
    
    // Create BudgetCategories junction table
    await queryInterface.createTable('BudgetCategories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      budget_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Budgets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    // Add unique index
    await queryInterface.addIndex('BudgetCategories', ['budget_id', 'category_id'], {
      unique: true,
      name: 'unique_budget_category'
    });
    
    // Recreate the budget progress view with new structure
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW budget_progress_view AS
      SELECT 
        b.id,
        b.user_id,
        b.name,
        b.limit_amount,
        b.currency,
        b.period_type,
        b.custom_start_date,
        b.custom_end_date,
        b.rollover,
        b.is_active,
        b.created_at,
        b.updated_at,
        COALESCE(SUM(t.amount), 0) as spent_amount,
        CASE 
          WHEN b.limit_amount > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.limit_amount * 100)::numeric, 2)
          ELSE 0
        END as progress_percentage
      FROM "Budgets" b
      LEFT JOIN "BudgetCategories" bc ON b.id = bc.budget_id
      LEFT JOIN "Transactions" t ON t.category_id = bc.category_id 
        AND t.user_id = b.user_id 
        AND t.transaction_type = 'expense'
        AND (
          (b.period_type = 'custom' AND t.transaction_date BETWEEN b.custom_start_date AND b.custom_end_date)
          OR (b.period_type = 'month' AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE))
          OR (b.period_type = 'week' AND DATE_TRUNC('week', t.transaction_date) = DATE_TRUNC('week', CURRENT_DATE))
        )
      WHERE b.is_active = true
      GROUP BY b.id;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the new view
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS budget_progress_view CASCADE;');
    
    // Drop BudgetCategories table
    await queryInterface.dropTable('BudgetCategories');
    
    // Revert column renames
    await queryInterface.renameColumn('Budgets', 'created_at', 'createdAt');
    await queryInterface.renameColumn('Budgets', 'updated_at', 'updatedAt');
    await queryInterface.renameColumn('Budgets', 'custom_start_date', 'start_date');
    await queryInterface.renameColumn('Budgets', 'custom_end_date', 'end_date');
    await queryInterface.renameColumn('Budgets', 'limit_amount', 'planned_amount');
    
    // Remove added columns
    await queryInterface.removeColumn('Budgets', 'rollover');
    await queryInterface.removeColumn('Budgets', 'currency');
    await queryInterface.removeColumn('Budgets', 'name');
    
    // Revert period_type enum
    await queryInterface.sequelize.query(`
      ALTER TABLE "Budgets" ALTER COLUMN period_type DROP DEFAULT;
      ALTER TABLE "Budgets" ALTER COLUMN period_type TYPE VARCHAR(255);
      DROP TYPE IF EXISTS "enum_Budgets_period_type";
      CREATE TYPE "enum_Budgets_period_type" AS ENUM('monthly', 'quarterly', 'yearly');
      ALTER TABLE "Budgets" ALTER COLUMN period_type TYPE "enum_Budgets_period_type" USING 
        CASE 
          WHEN period_type = 'month' THEN 'monthly'
          WHEN period_type = 'week' THEN 'monthly'
          ELSE 'monthly'
        END::"enum_Budgets_period_type";
    `);
    
    // Make dates non-nullable again
    await queryInterface.changeColumn('Budgets', 'start_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE')
    });
    
    await queryInterface.changeColumn('Budgets', 'end_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE + INTERVAL \'1 month\'')
    });
    
    // Add back category_id
    await queryInterface.addColumn('Budgets', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    
    // Remove the default after adding
    await queryInterface.sequelize.query('ALTER TABLE "Budgets" ALTER COLUMN category_id DROP DEFAULT;');
    
    // Add back the unique index
    await queryInterface.addIndex('Budgets', ['user_id', 'category_id', 'start_date', 'end_date'], {
      unique: true,
      name: 'unique_budget_period'
    });
    
    // Recreate original view
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW budget_progress_view AS
      SELECT 
        b.*,
        COALESCE(SUM(t.amount), 0) as spent_amount,
        CASE 
          WHEN b.planned_amount > 0 THEN ROUND((COALESCE(SUM(t.amount), 0) / b.planned_amount * 100)::numeric, 2)
          ELSE 0
        END as progress_percentage
      FROM "Budgets" b
      LEFT JOIN "Transactions" t ON t.category_id = b.category_id 
        AND t.user_id = b.user_id 
        AND t.transaction_type = 'expense'
        AND t.transaction_date BETWEEN b.start_date AND b.end_date
      WHERE b.is_active = true
      GROUP BY b.id;
    `);
  }
};