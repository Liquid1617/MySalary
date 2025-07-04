'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Сначала добавляем поле category_id
    await queryInterface.addColumn('Expenses', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // временно разрешаем null
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    
    // Добавляем индекс для category_id
    await queryInterface.addIndex('Expenses', ['category_id'], {
      name: 'idx_expenses_category_id'
    });
    
    // Удаляем старое поле category
    await queryInterface.removeColumn('Expenses', 'category');
    
    // Делаем category_id обязательным после заполнения данных
    await queryInterface.changeColumn('Expenses', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    // Сначала делаем category_id nullable
    await queryInterface.changeColumn('Expenses', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    
    // Добавляем обратно поле category
    await queryInterface.addColumn('Expenses', 'category', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    // Удаляем индекс и поле category_id
    await queryInterface.removeIndex('Expenses', 'idx_expenses_category_id');
    await queryInterface.removeColumn('Expenses', 'category_id');
  }
}; 