'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if budgets table exists
      const [results] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'budgets'
        );
      `);
      
      if (!results[0].exists) {
        console.log('⚠️ Budgets table does not exist - skipping budget view creation');
        return;
      }
      
      // Drop existing view
      await queryInterface.sequelize.query('DROP VIEW IF EXISTS budget_progress_view;');
    
    // Recreate view with status filter to exclude scheduled transactions
    await queryInterface.sequelize.query(`
      CREATE VIEW budget_progress_view AS
      SELECT 
        b.id as budget_id,
        b.category_id,
        b.amount as budget_amount,
        b.period,
        b.start_date,
        b.end_date,
        b.user_id,
        c.category_name,
        c.icon,
        c.category_type,
        COALESCE(SUM(
          CASE 
            WHEN curr.code = user_curr.code THEN t.amount
            ELSE t.amount * COALESCE(er.rate, 1.0)
          END
        ), 0) as spent_amount
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON (
        t.category_id = b.category_id 
        AND t.user_id = b.user_id
        AND t.transaction_type = 'expense'
        AND t.status = 'posted'
        AND t.transaction_date >= b.start_date 
        AND t.transaction_date < b.end_date
      )
      LEFT JOIN accounts acc ON t.account_id = acc.id
      LEFT JOIN currencies curr ON acc.currency_id = curr.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN currencies user_curr ON u.primary_currency_id = user_curr.id
      LEFT JOIN exchange_rates er ON (
        er.from_currency_id = curr.id 
        AND er.to_currency_id = user_curr.id
        AND er.date = (
          SELECT MAX(date) 
          FROM exchange_rates 
          WHERE from_currency_id = curr.id 
            AND to_currency_id = user_curr.id 
            AND date <= CURRENT_DATE
        )
      )
      GROUP BY 
        b.id, b.category_id, b.amount, b.period, b.start_date, b.end_date, b.user_id,
        c.category_name, c.icon, c.category_type;
    `);
    } catch (error) {
      console.log('⚠️ Error updating budget view, but continuing:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop the view
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS budget_progress_view;');
    
    // Recreate original view without status filter
    await queryInterface.sequelize.query(`
      CREATE VIEW budget_progress_view AS
      SELECT 
        b.id as budget_id,
        b.category_id,
        b.amount as budget_amount,
        b.period,
        b.start_date,
        b.end_date,
        b.user_id,
        c.category_name,
        c.icon,
        c.category_type,
        COALESCE(SUM(
          CASE 
            WHEN curr.code = user_curr.code THEN t.amount
            ELSE t.amount * COALESCE(er.rate, 1.0)
          END
        ), 0) as spent_amount
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON (
        t.category_id = b.category_id 
        AND t.user_id = b.user_id
        AND t.transaction_type = 'expense'
        AND t.transaction_date >= b.start_date 
        AND t.transaction_date < b.end_date
      )
      LEFT JOIN accounts acc ON t.account_id = acc.id
      LEFT JOIN currencies curr ON acc.currency_id = curr.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN currencies user_curr ON u.primary_currency_id = user_curr.id
      LEFT JOIN exchange_rates er ON (
        er.from_currency_id = curr.id 
        AND er.to_currency_id = user_curr.id
        AND er.date = (
          SELECT MAX(date) 
          FROM exchange_rates 
          WHERE from_currency_id = curr.id 
            AND to_currency_id = user_curr.id 
            AND date <= CURRENT_DATE
        )
      )
      GROUP BY 
        b.id, b.category_id, b.amount, b.period, b.start_date, b.end_date, b.user_id,
        c.category_name, c.icon, c.category_type;
    `);
  }
};