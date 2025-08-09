'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('Adding missing columns to Categories table...');
    
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      const tableDescription = await queryInterface.describeTable('Categories');
      
      // Add icon column
      if (!tableDescription.icon) {
        await queryInterface.addColumn('Categories', 'icon', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'FontAwesome icon name for the category'
        }, { transaction });
        console.log('Added icon column');
      }
      
      // Add color column
      if (!tableDescription.color) {
        await queryInterface.addColumn('Categories', 'color', {
          type: Sequelize.STRING(7),
          allowNull: true,
          defaultValue: '#6B7280',
          comment: 'Hex color code for the category icon'
        }, { transaction });
        console.log('Added color column');
      }
      
      // Add is_system column
      if (!tableDescription.is_system) {
        await queryInterface.addColumn('Categories', 'is_system', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'TRUE for system categories, FALSE for user-created categories'
        }, { transaction });
        console.log('Added is_system column');
      }
      
      // Update existing categories with default icons and colors
      const categoryIcons = {
        // Income categories
        'Salary': { icon: 'money-bill-wave', color: '#10B981' },
        'Bonus & Rewards': { icon: 'gift', color: '#10B981' },
        'Freelance': { icon: 'laptop', color: '#10B981' },
        'Investments': { icon: 'chart-line', color: '#10B981' },
        'Sales & Trade': { icon: 'handshake', color: '#10B981' },
        'Rental Income': { icon: 'home', color: '#10B981' },
        'Pension & Benefits': { icon: 'shield-alt', color: '#10B981' },
        'Scholarship': { icon: 'graduation-cap', color: '#10B981' },
        'Gifts & Inheritance': { icon: 'gift', color: '#10B981' },
        'Tax Refund': { icon: 'file-invoice-dollar', color: '#10B981' },
        'Cashback': { icon: 'credit-card', color: '#10B981' },
        'Other Income': { icon: 'plus-circle', color: '#10B981' },
        
        // Expense categories
        'Food & Groceries': { icon: 'shopping-cart', color: '#EF4444' },
        'Transportation': { icon: 'car', color: '#EF4444' },
        'Utilities': { icon: 'bolt', color: '#EF4444' },
        'Entertainment': { icon: 'gamepad', color: '#EF4444' },
        'Clothing & Shoes': { icon: 'tshirt', color: '#EF4444' },
        'Healthcare': { icon: 'heartbeat', color: '#EF4444' },
        'Education': { icon: 'graduation-cap', color: '#EF4444' },
        'Home & Garden': { icon: 'home', color: '#EF4444' },
        'Loans & Credit': { icon: 'credit-card', color: '#EF4444' },
        'Sports & Fitness': { icon: 'dumbbell', color: '#EF4444' },
        'Travel': { icon: 'plane', color: '#EF4444' },
        'Restaurants & Cafes': { icon: 'utensils', color: '#EF4444' },
        'Gas & Parking': { icon: 'gas-pump', color: '#EF4444' },
        'Beauty & Care': { icon: 'spa', color: '#EF4444' },
        'Gifts': { icon: 'gift', color: '#EF4444' },
        'Other Expenses': { icon: 'ellipsis-h', color: '#EF4444' }
      };
      
      // Get all existing categories
      const existingCategories = await queryInterface.sequelize.query(
        'SELECT id, category_name, category_type FROM "Categories"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );
      
      // Update each category with appropriate icon and color
      for (const category of existingCategories) {
        const iconData = categoryIcons[category.category_name] || {
          icon: category.category_type === 'income' ? 'arrow-up' : 'arrow-down',
          color: category.category_type === 'income' ? '#10B981' : '#EF4444'
        };
        
        await queryInterface.sequelize.query(
          'UPDATE "Categories" SET icon = :icon, color = :color, is_system = true WHERE id = :id',
          {
            replacements: {
              id: category.id,
              icon: iconData.icon,
              color: iconData.color
            },
            type: Sequelize.QueryTypes.UPDATE,
            transaction
          }
        );
      }
      
      await transaction.commit();
      console.log('Successfully added missing columns to Categories table!');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.removeColumn('Categories', 'icon', { transaction });
      await queryInterface.removeColumn('Categories', 'color', { transaction });
      await queryInterface.removeColumn('Categories', 'is_system', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};