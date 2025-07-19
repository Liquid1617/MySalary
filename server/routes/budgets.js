const express = require('express');
const router = express.Router();
const { Budget, BudgetCategory, Category, Transaction, Account, Currency, User } = require('../db/models');
const authMiddleware = require('../middleware/auth');
const { Op } = require('sequelize');
const exchangeRateService = require('../services/exchangeRate');

// Get all budgets for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: BudgetCategory,
          as: 'categories',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'category_name', 'category_type']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate spent amounts for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const categoryIds = budget.categories.map(bc => bc.category_id);
        
        // Calculate date range based on period type
        let startDate = new Date();
        let endDate = new Date();
        
        // Always use custom_start_date and custom_end_date fields
        if (budget.custom_start_date && budget.custom_end_date) {
          startDate = new Date(budget.custom_start_date);
          endDate = new Date(budget.custom_end_date);
          console.log(`✅ Budget "${budget.name}" (${budget.period_type}) using stored dates: ${budget.custom_start_date} to ${budget.custom_end_date}`);
          
          // Validate weekly budgets have Monday-Sunday boundaries
          if (budget.period_type === 'week') {
            const startDay = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const endDay = endDate.getDay();
            if (startDay !== 1 || endDay !== 0) {
              console.warn(`⚠️  Weekly budget "${budget.name}" has incorrect boundaries - Start: ${startDay} (should be 1), End: ${endDay} (should be 0)`);
            }
          }
        } else {
          // Fallback for old budgets without custom dates
          console.warn(`⚠️  Budget "${budget.name}" (${budget.period_type}) missing stored dates - using fallback logic from created_at: ${budget.created_at}`);
          startDate = new Date(budget.created_at);
          const now = new Date();
          if (budget.period_type === 'month') {
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
          } else if (budget.period_type === 'week') {
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
          } else {
            endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default
          }
          console.log(`📅 Fallback calculated dates: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        }

        // Get total spent for categories in this budget
        const transactions = await Transaction.findAll({
          where: {
            user_id: req.user.id,
            category_id: { [Op.in]: categoryIds },
            transaction_type: 'expense',
            status: 'posted', // Исключаем scheduled транзакции
            transaction_date: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          },
          include: [
            {
              model: Account,
              as: 'account',
              include: [
                {
                  model: Currency,
                  as: 'currency',
                  attributes: ['id', 'code', 'name', 'symbol']
                }
              ],
              attributes: ['id', 'account_name', 'currency_id']
            }
          ]
        });

        // Calculate spent amount with currency conversion
        let spentAmount = 0;
        const budgetCurrency = budget.currency; // Budget currency (e.g., "USD")
        
        for (const transaction of transactions) {
          const transactionAmount = parseFloat(transaction.amount);
          const transactionCurrency = transaction.account?.currency?.code; // Transaction currency from account
          
          if (!transactionCurrency) {
            console.warn(`Transaction ${transaction.id} has no currency info, skipping`);
            continue;
          }
          
          try {
            // Convert transaction amount to budget currency
            const convertedAmount = await exchangeRateService.convertCurrency(
              transactionAmount, 
              transactionCurrency, 
              budgetCurrency
            );
            spentAmount += convertedAmount;
            
            console.log(`Converted ${transactionAmount} ${transactionCurrency} → ${convertedAmount.toFixed(2)} ${budgetCurrency}`);
          } catch (error) {
            console.error(`Failed to convert ${transactionAmount} ${transactionCurrency} to ${budgetCurrency}:`, error.message);
            // Fallback: add original amount (не идеально, но лучше чем потерять транзакцию)
            spentAmount += transactionAmount;
          }
        }
        const limitAmount = parseFloat(budget.limit_amount);
        const percentage = limitAmount > 0 ? (spentAmount / limitAmount) * 100 : 0;

        return {
          id: budget.id,
          user_id: budget.user_id,
          name: budget.name,
          limit_amount: limitAmount,
          spent_amount: spentAmount,
          spent: spentAmount, // Add for frontend compatibility
          percent: percentage, // Add calculated percentage
          currency: budget.currency,
          period_type: budget.period_type,
          custom_start_date: budget.custom_start_date,
          custom_end_date: budget.custom_end_date,
          rollover: budget.rollover,
          created_at: budget.created_at,
          updated_at: budget.updated_at,
          categories: budget.categories.map(bc => ({
            category_id: bc.category_id.toString(),
            category: {
              id: bc.category.id,
              name: bc.category.category_name,
              type: bc.category.category_type
            }
          }))
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Create new budget
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      limit_amount,
      currency,
      period_type,
      custom_start_date,
      custom_end_date,
      rollover,
      categories
    } = req.body;

    console.log(`=== CREATE BUDGET SERVER ===`);
    console.log(`Full request body:`, JSON.stringify(req.body, null, 2));
    console.log(`Received dates: ${custom_start_date} to ${custom_end_date}`);

    // Determine budget currency - use provided or user's primary currency
    let budgetCurrency = currency;
    if (!budgetCurrency) {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Currency,
            as: 'primaryCurrency',
            attributes: ['code']
          }
        ]
      });
      
      if (user?.primaryCurrency?.code) {
        budgetCurrency = user.primaryCurrency.code;
        console.log(`No currency provided, using user's primary currency: ${budgetCurrency}`);
      } else {
        budgetCurrency = 'USD'; // Fallback
        console.log(`No primary currency found for user, using fallback: ${budgetCurrency}`);
      }
    }

    // Use provided dates (frontend calculates all dates now)
    let finalStartDate = custom_start_date;
    let finalEndDate = custom_end_date;
    
    // Validation - ensure dates are provided
    if (!finalStartDate || !finalEndDate) {
      return res.status(400).json({ 
        error: 'Start and end dates are required for all budget types' 
      });
    }
    
    console.log(`Final dates to save: ${finalStartDate} to ${finalEndDate}`);

    // Create budget with calculated dates
    console.log(`Creating budget with data:`, {
      user_id: req.user.id,
      name,
      limit_amount,
      currency: budgetCurrency,
      period_type,
      custom_start_date: finalStartDate,
      custom_end_date: finalEndDate,
      rollover: rollover || false
    });
    
    const budget = await Budget.create({
      user_id: req.user.id,
      name,
      limit_amount,
      currency: budgetCurrency,
      period_type,
      custom_start_date: finalStartDate,
      custom_end_date: finalEndDate,
      rollover: rollover || false
    });

    console.log(`Budget created. Reading from DB:`, {
      id: budget.id,
      name: budget.name,
      period_type: budget.period_type,
      custom_start_date: budget.custom_start_date,
      custom_end_date: budget.custom_end_date
    });

    // Create budget categories
    if (categories && categories.length > 0) {
      const budgetCategories = categories.map(categoryId => ({
        budget_id: budget.id,
        category_id: parseInt(categoryId)
      }));
      await BudgetCategory.bulkCreate(budgetCategories);
    }

    // Fetch complete budget with categories
    const completeBudget = await Budget.findByPk(budget.id, {
      include: [
        {
          model: BudgetCategory,
          as: 'categories',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'category_name', 'category_type']
            }
          ]
        }
      ]
    });

    res.status(201).json(completeBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Update budget
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      limit_amount,
      currency,
      period_type,
      custom_start_date,
      custom_end_date,
      rollover,
      categories
    } = req.body;

    console.log(`=== UPDATE BUDGET SERVER ===`);
    console.log(`Budget ID: ${id}`);
    console.log(`Full request body:`, JSON.stringify(req.body, null, 2));
    console.log(`Received dates: ${custom_start_date} to ${custom_end_date}`);

    // Determine budget currency - use provided or user's primary currency (similar to create)
    let budgetCurrency = currency;
    if (!budgetCurrency) {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Currency,
            as: 'primaryCurrency',
            attributes: ['code']
          }
        ]
      });
      
      if (user?.primaryCurrency?.code) {
        budgetCurrency = user.primaryCurrency.code;
        console.log(`No currency provided for update, using user's primary currency: ${budgetCurrency}`);
      } else {
        budgetCurrency = 'USD'; // Fallback
        console.log(`No primary currency found for user during update, using fallback: ${budgetCurrency}`);
      }
    }

    // Find budget
    const budget = await Budget.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    console.log(`Found existing budget:`, {
      id: budget.id,
      name: budget.name,
      period_type: budget.period_type,
      custom_start_date: budget.custom_start_date,
      custom_end_date: budget.custom_end_date
    });

    // Use provided dates (frontend calculates all dates now)
    let finalStartDate = custom_start_date;
    let finalEndDate = custom_end_date;
    
    // Validation - ensure dates are provided
    if (!finalStartDate || !finalEndDate) {
      return res.status(400).json({ 
        error: 'Start and end dates are required for all budget types' 
      });
    }
    
    console.log(`Final dates to save: ${finalStartDate} to ${finalEndDate}`);

    // Update budget
    console.log(`Updating budget with data:`, {
      name,
      limit_amount,
      currency: budgetCurrency,
      period_type,
      custom_start_date: finalStartDate,
      custom_end_date: finalEndDate,
      rollover: rollover || false
    });
    
    await budget.update({
      name,
      limit_amount,
      currency: budgetCurrency,
      period_type,
      custom_start_date: finalStartDate,
      custom_end_date: finalEndDate,
      rollover: rollover || false
    });

    console.log(`Budget updated. Refreshing from DB...`);
    await budget.reload();
    console.log(`Budget after update:`, {
      id: budget.id,
      name: budget.name,
      period_type: budget.period_type,
      custom_start_date: budget.custom_start_date,
      custom_end_date: budget.custom_end_date
    });

    // Update categories
    if (categories !== undefined) {
      // Delete existing categories
      await BudgetCategory.destroy({
        where: { budget_id: budget.id }
      });

      // Create new categories
      if (categories.length > 0) {
        // Validate and convert category IDs to integers
        const validCategoryIds = [];
        for (const categoryId of categories) {
          const parsedId = parseInt(categoryId);
          if (isNaN(parsedId)) {
            return res.status(400).json({ error: `Invalid category ID: ${categoryId}` });
          }
          
          // Check if category exists
          const categoryExists = await Category.findByPk(parsedId);
          if (!categoryExists) {
            return res.status(400).json({ error: `Category with ID ${parsedId} does not exist` });
          }
          
          validCategoryIds.push(parsedId);
        }
        
        const budgetCategories = validCategoryIds.map(categoryId => ({
          budget_id: budget.id,
          category_id: categoryId
        }));
        await BudgetCategory.bulkCreate(budgetCategories);
      }
    }

    // Fetch complete budget with categories
    const completeBudget = await Budget.findByPk(budget.id, {
      include: [
        {
          model: BudgetCategory,
          as: 'categories',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'category_name', 'category_type']
            }
          ]
        }
      ]
    });

    res.json(completeBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete budget
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`=== DELETING BUDGET (Backend) ===`);
    console.log(`Budget ID from params: ${id} (type: ${typeof id})`);
    console.log(`User ID: ${req.user.id}`);

    const budget = await Budget.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!budget) {
      console.log(`Budget not found for ID: ${id} and user: ${req.user.id}`);
      return res.status(404).json({ error: 'Budget not found' });
    }

    console.log(`Found budget: ${budget.name} (ID: ${budget.id})`);

    // Delete budget categories first
    const deletedCategories = await BudgetCategory.destroy({
      where: { budget_id: budget.id }
    });
    
    console.log(`Deleted ${deletedCategories} budget categories`);

    // Delete budget
    await budget.destroy();
    
    console.log(`Budget ${budget.id} deleted successfully`);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting budget:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to delete budget', details: error.message });
  }
});

module.exports = router;