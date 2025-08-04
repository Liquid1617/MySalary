'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check and add user_id column for custom categories
      const tableDescription = await queryInterface.describeTable('Categories');
      
      if (!tableDescription.user_id) {
        await queryInterface.addColumn('Categories', 'user_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'NULL for system categories, user ID for custom categories'
        }, { transaction });
      }

      // Add icon field for categories
      if (!tableDescription.icon) {
        await queryInterface.addColumn('Categories', 'icon', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'FontAwesome icon name for the category'
        }, { transaction });
      }

      // Add color field for categories
      if (!tableDescription.color) {
        await queryInterface.addColumn('Categories', 'color', {
          type: Sequelize.STRING(7),
          allowNull: true,
          defaultValue: '#6B7280',
          comment: 'Hex color code for the category icon'
        }, { transaction });
      }

      // Add is_system flag to distinguish system vs user categories
      if (!tableDescription.is_system) {
        await queryInterface.addColumn('Categories', 'is_system', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'TRUE for system categories, FALSE for user-created categories'
        }, { transaction });
      }

      // Update existing categories to be system categories with icons
      const existingCategories = await queryInterface.sequelize.query(
        'SELECT id, category_name, category_type FROM "Categories"',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

    // Define icons for existing categories
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

      // Update existing categories with icons and mark as system
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

      // Try to drop the old unique constraint if it exists
      try {
        await queryInterface.removeConstraint('Categories', 'categories_category_type_category_name_key', { transaction });
      } catch (error) {
        console.log('Old constraint not found, skipping removal');
      }

      // Add new compound unique constraint that includes user_id
      try {
        await queryInterface.addConstraint('Categories', {
          fields: ['category_type', 'category_name', 'user_id'],
          type: 'unique',
          name: 'categories_unique_per_user'
        }, { transaction });
      } catch (error) {
        console.log('Constraint already exists, skipping');
      }

      // Add index for user categories lookup
      try {
        await queryInterface.addIndex('Categories', ['user_id'], {
          name: 'categories_user_id_idx'
        }, { transaction });
      } catch (error) {
        console.log('Index already exists, skipping');
      }

      // Add index for system categories lookup
      try {
        await queryInterface.addIndex('Categories', ['is_system'], {
          name: 'categories_is_system_idx'
        }, { transaction });
      } catch (error) {
        console.log('Index already exists, skipping');
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('Categories', 'categories_user_id_idx');
    await queryInterface.removeIndex('Categories', 'categories_is_system_idx');

    // Remove new constraint
    await queryInterface.removeConstraint('Categories', 'categories_unique_per_user');

    // Restore old constraint
    await queryInterface.addConstraint('Categories', {
      fields: ['category_type', 'category_name'],
      type: 'unique',
      name: 'categories_category_type_category_name_key'
    });

    // Remove new columns
    await queryInterface.removeColumn('Categories', 'user_id');
    await queryInterface.removeColumn('Categories', 'icon');
    await queryInterface.removeColumn('Categories', 'color');
    await queryInterface.removeColumn('Categories', 'is_system');
  }
};