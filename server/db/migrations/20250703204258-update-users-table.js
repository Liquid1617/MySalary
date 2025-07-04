'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем новое поле country_id
    await queryInterface.addColumn('Users', 'country_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Countries',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    // Добавляем индекс для country_id
    await queryInterface.addIndex('Users', ['country_id'], {
      name: 'idx_users_country_id'
    });
    
    // Удаляем старое поле country
    await queryInterface.removeColumn('Users', 'country');
  },

  async down(queryInterface, Sequelize) {
    // Добавляем обратно старое поле country
    await queryInterface.addColumn('Users', 'country', {
      type: Sequelize.STRING
    });
    
    // Удаляем индекс и поле country_id
    await queryInterface.removeIndex('Users', 'idx_users_country_id');
    await queryInterface.removeColumn('Users', 'country_id');
  }
};
