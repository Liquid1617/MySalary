'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'primary_currency_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Currencies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Устанавливаем USD как валюту по умолчанию для существующих пользователей
    const usdCurrency = await queryInterface.sequelize.query(
      'SELECT id FROM "Currencies" WHERE code = \'USD\'',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (usdCurrency.length > 0) {
      await queryInterface.sequelize.query(
        `UPDATE "Users" SET primary_currency_id = ${usdCurrency[0].id} WHERE primary_currency_id IS NULL`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'primary_currency_id');
  }
}; 